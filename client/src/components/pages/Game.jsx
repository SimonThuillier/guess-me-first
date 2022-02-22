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


function getGameId(){
  let match = window.location.href.match(/\/(g_[^\/]+)$/);
  if (!match) return null;
  return match[1];
}

const defaultRoundData = {goodChoice: null, hasCompletedRound: false, wrongChoices: []}

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
      console.log('gameLoaded', args);
      if(!!args[0].error){
        navigate('/unknown-game');
        return;
      }
      const data = args[0].data;
      const _chatMessages = data.chatMessages;
      data.chatMessages = null;
      setGameData(data);
      // for rendering optimization purposes chatMessages are handled separately from the rest of the game data
      setChatMessages(_chatMessages);
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
      console.log('emit ChatMessage', message);
      socket.emit('emitChatMessage', {
        gameId: getGameId(),
        playerId: getPlayerId(),
        playerName: getPlayerName(),
        message: message
      });
    });

    socket.off('chatMessages').on('chatMessages', (...args) => {
      if(args[0].gameId !== getGameId()) return;
      console.log('old chatMessages', chatMessages);
      console.log('new ChatMessages', args[0].messages);
      const concatMessages = [...chatMessages, ...args[0].messages];
      console.log('concatMessages', concatMessages);
      setChatMessages(concatMessages);
    });
  }, [chatMessages]);

  // gameData effects, all effects during ongoing game are handled here
  useEffect(() => {

    socket.off('gameStarted').on('gameStarted', (...args) => {
      const data = args[0];
      console.log(data);
      if(data.gameId !== getGameId()) return;
      setGameData(data);
      setGameStatus({status: "STARTED", message:null});  
    });

    socket.off('roundUpdate').on('roundUpdate', (...args) => {
      const data = args[0];
      
      if(data.gameId !== getGameId()) return;
      setRoundData(data.roundData);
    });

    socket.off('gameUpdate').on('gameUpdate', (...args) => {
      const data = args[0];
      if(data.gameId !== getGameId()) return;
      console.log("gameUpdate received");
      if(gameData.currentRound.roundNumber !== data.currentRound.roundNumber){
        console.log("roundUpdate received", data.currentRound);
        console.log("current timestamp", Math.floor(Date.now() / 1000));
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
  else {
    const onGuess = (guess) => {
      socket.emit('submitGuess', {gameId: getGameId(), guess: guess});
    }
    gameComponent = 
      <div>
        <GamePanel url={gameData.currentRound.image.url} startAt={gameData.currentRound.startAt}/>
        <GameFooter 
        choices={gameData.currentRound.image.choices} 
        startAt={gameData.currentRound.startAt}
        roundData={roundData} 
        onGuess={onGuess} 
        />
      </div>
  }

  return (
    <Layout>
      <div className="game-container">
        {gameComponent}
      </div>
      <GameToast messages={chatMessages} hasStarted={!!gameData.startedAt} setShowOffCanvas={setShowOffCanvas} chatSubmit={chatSubmit}/>
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