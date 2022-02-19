import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Chat from '../organisms/Chat';
import GameLoading from "../organisms/GameLoading";
import GamePanel from "../organisms/GamePanel";

function getGameId(){
  let match = window.location.href.match(/\/(g_[^\/]+)$/);
  if (!match) return null;
  return match[1];
}


function Game() {
  // for fast loading new game data in case you just created it
  const [gameData, setGameData] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  // beware when using functions as state, it should be a function returned by a first function 
  // because of lazy loading feature of react (see https://reactjs.org/docs/hooks-reference.html#usestate)
  const [chatSubmit, setChatSubmit] = useState(() => () => {});
  const [gameStatus, setGameStatus] = useState({status: "CONNECTING", message:null});
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
      }
      const data = args[0].data;
      const _chatMessages = data.chatMessages;
      data.chatMessages = null;
      console.log(data);
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


  if(!gameData){
    const onAlertDismiss = () => {
      sioSingleton.getDefaultSocket().disconnect();
      sioSingleton.getSocket('/game').disconnect();
      navigate('/');
    }
    return (<GameLoading gameStatus={gameStatus} onAlertDismiss={onAlertDismiss}/>);
  }

  return (
    <Layout>
        <Row>
          <Col md={8} ><GamePanel gameData={gameData} gameStatus={gameStatus}/></Col>
          <Col md={4}>
            <Chat messages={chatMessages} onSubmit={chatSubmit}/>
          </Col>
      </Row>
    </Layout>
  )
}

export default Game