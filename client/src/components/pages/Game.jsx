import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Row, Col, Toast, ToastContainer, Button, Offcanvas} from "react-bootstrap";
import Layout from '../Layout';
import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';

import GameLoading from "../organisms/GameLoading";
import GamePanelPending from "../organisms/GamePanelPending";
import GamePanel from "../organisms/GamePanel";
import GameOffCanvas from "../organisms/GameOffCanvas";
import GameToast from "../molecules/GameToast";
import GameFooter from '../molecules/GameFooter';
import GameFooterEnded from '../molecules/GameFooterEnded';


function getGameId(){
  let match = window.location.href.match(/\/(g_[^\/]+)$/);
  if (!match) return null;
  return match[1];
}

const defaultRoundData = {goodChoice: null, hasCompletedRound: false, wrongChoices: []};

function Game() {
  // public general gameData
  const [gameData, setGameData] = useState(null);
  // round - player specific - Data used during ongoing game
  const [roundData, setRoundData] = useState({...defaultRoundData});
  // chat data
  const [chatMessages, setChatMessages] = useState([]);
  // beware when using functions as state, it should be a function returned by a first function 
  // because of lazy loading feature of react (see https://reactjs.org/docs/hooks-reference.html#usestate)
  const [chatSubmit, setChatSubmit] = useState(() => () => {});
  const [gameStatus, setGameStatus] = useState({status: "CONNECTING", message:null});

  const [showOffCanvas, setShowOffCanvas] = useState(false);


  const navigate = useNavigate();

  if (!getGameId()){
    window.location = '/unknown-game';
    return (<GameLoading gameStatus={gameStatus} />);
  }

  const socket = sioSingleton.getSocket('/game');

  // called upon successful connection or reconnection 
  const onConnect = () => {
    socket.emit('loadGame', {
      playerId: getPlayerId(),
      playerName: getPlayerName(),
      gameId: getGameId()
    });
    setGameStatus({status: "LOADING", message:null});
  }

  // called upon connection or reconnection failure 
  const onConnectFailed = (err) => {
    setGameStatus({status: "CONNECTING", error: true, message:err.message});
  }

  // startup effect  
  useEffect(() => {
    const gameId = getGameId();

    socket.off('gameLoaded').on('gameLoaded', (...args) => {
      //console.log('gameLoaded', args);
      if(!!args[0].error){
        navigate('/unknown-game');
        return;
      }
      const data = args[0].data;
      const _chatMessages = data.chatMessages;
      data.chatMessages = null;
      setGameData(data);
      
      // for rendering optimization purposes chatMessages are handled separately from the rest of the game data
      // special updates for reset cases
      // moreover if this loading occurs becaure of a reset chat data won't be updated
      if(!! _chatMessages){
        setChatMessages(_chatMessages);
      }
      // reinit round data if game not started
      if(!data.startedAt){
        setRoundData({...defaultRoundData});
      }
      //
      
      setGameStatus({status: "LOADED", message:null});
    });

    if(socket.connected){
      console.log("deja co :)");
      onConnect();
    }
    else{
      console.log("pas deja co");
      socket.off('connect').on('connect', onConnect);
      socket.off('connect_error').on('connect_error', onConnectFailed);
      socket.connect();
    }
  
    return function cleanup() {
      const socket = sioSingleton.getSocket('/game');
      socket.off('gameLoaded');
      socket.off('chatMessages');
      socket.off('connect');
      socket.off('connect_error');
      if(!gameId) return;
      console.log("sending leaveGame notification to backend");
      socket.emit('leaveGame', {gameId: gameId});
      };
  }, []);

  // chatMessage reception effect (changes after each message reception because is dependent from current messages)
  useEffect(() => {

    setChatSubmit(() => (message) => {
      socket.emit('emitChatMessage', {
        gameId: getGameId(),
        playerId: getPlayerId(),
        playerName: getPlayerName(),
        message: message
      });
    });

    socket.off('chatMessages').on('chatMessages', (...args) => {
      if(args[0].gameId !== getGameId()) return;
      const concatMessages = [...chatMessages, ...args[0].messages];
      setChatMessages(concatMessages);
    });
  }, [chatMessages]);

  // gameData effects, all effects during ongoing game are handled here
  useEffect(() => {

    socket.off('gameStarted').on('gameStarted', (...args) => {
      const data = args[0];
      //console.log(data);
      if(data.gameId !== getGameId()) return;
      setGameData(data);
      setGameStatus({status: "STARTED", message:null});  
      // hide canvas to prevent user from not seeing the beginning of the game
      setShowOffCanvas(false);
    });

    socket.off('roundUpdate').on('roundUpdate', (...args) => {
      const data = args[0];
      
      if(data.gameId !== getGameId()) return;
      setRoundData(data.roundData);
    });

    socket.off('gameUpdate').on('gameUpdate', (...args) => {
      const data = args[0];
      if(data.gameId !== getGameId()) return;
      //console.log("gameUpdate received");
      if(!gameData.currentRound || gameData.currentRound.roundNumber !== data.currentRound.roundNumber){
        setRoundData({...defaultRoundData});
      }
      setGameData(data);
    });


    return () => {
      socket.off('gameStarted');
      socket.off('roundUpdate');
      socket.off('gameUpdate');
    }
  }, [gameData, roundData]);


  if(!gameData){
    const onAlertDismiss = () => {
      sioSingleton.getDefaultSocket().disconnect();
      sioSingleton.getSocket('/game').disconnect();
      navigate('/');
    }
    return (<GameLoading gameStatus={gameStatus} onAlertDismiss={onAlertDismiss}/>);
  }

  let gameComponent = <div>Game</div>;
  if (!gameData.startedAt){
    let onStart = () => {};
    if(getPlayerId() === gameData.creatorId){
      onStart = () => {
        socket.emit('startGame', {gameId: getGameId()});
      }
    }
    gameComponent = <GamePanelPending gameData={gameData} onStart={onStart}/>;
  }
  else if (!!gameData.endedAt){

    let onReset = () => {};
    if(getPlayerId() === gameData.creatorId){
      onReset = () => {
        socket.emit('resetGame', {gameId: getGameId()});
      }
    }

    gameComponent = 
      <>
        <GamePanel url={gameData.currentRound.image.url} startAt={gameData.currentRound.startAt}/>
        <GameFooterEnded gameData={gameData} onReset={onReset}/>
      </>
  }
  else {
    const onGuess = (guess) => {
      socket.emit('submitGuess', {gameId: getGameId(), guess: guess});
    }
    gameComponent = 
      <>
        <GamePanel url={gameData.currentRound.image.url} startAt={gameData.currentRound.startAt}/>
        <GameFooter 
          choices={gameData.currentRound.image.choices} 
          startAt={gameData.currentRound.startAt}
          endAt={gameData.currentRound.endAt}
          roundNumber={gameData.currentRound.roundNumber}
          roundData={roundData} 
          onGuess={onGuess} 
        />
      </>
  }

  return (
    <Layout>
      <div className="game-container">
        {gameComponent}
      </div>
      <GameToast 
        messages={chatMessages} 
        hasStarted={!!gameData.startedAt}
        hasEnded={!!gameData.endedAt}
        setShowOffCanvas={setShowOffCanvas} 
        chatSubmit={chatSubmit}
      />
      <GameOffCanvas 
        show={showOffCanvas} 
        setShow={setShowOffCanvas} 
        messages={chatMessages} 
        chatSubmit={chatSubmit}
        scoreboard={gameData.scoreboard}
      />
    </Layout>
  )
}

export default Game