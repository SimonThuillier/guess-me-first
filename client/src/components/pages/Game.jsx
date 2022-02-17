import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Chat from '../organisms/Chat';
import GameLoading from "../organisms/GameLoading";
import GamePanel from "../organisms/GamePanel";

function Game() {
  // for fast loading new game data in case you just created it
  const [gameData, setGameData] = useState("gameData",null);
  const [gameStatus, setGameStatus] = useState("gameStatus",{status: "CONNECTING", message:null});
  const navigate = useNavigate();

  let match = window.location.href.match(/\/(g_[^\/]+)$/);
  if (!match){
    window.location = '/unknown-game';
    return (<GameLoading gameStatus={gameStatus} />);
  }
  const gameId = match[1];

  console.log(gameId);
  console.log(gameData);

  const onChatMessages = (...args) => {
    console.log('newChatMessages');
    console.log(args[0]);
  }

  const onConnect = () => {
    const socket = sioSingleton.getSocket('/game');

    socket.off('gameLoaded').on('gameLoaded', (...args) => {
      console.log('gameLoaded', args);
      if(!!args[0].error){
        navigate('/unknown-game');
      }
      setGameData(args[0].data);
    });

    socket.off('chat-messages').on('chat-messages', onChatMessages);

    socket.emit('loadGame', {
      playerId: getPlayerId(),
      playerName: getPlayerName(),
      gameId: gameId
    });

    setGameStatus({status: "LOADING", message:null});
  }

  const onConnectFailed = (err) => {
    setGameStatus({status: "ERROR", message:err.message});
  }  

  useEffect(() => {
    const socket = sioSingleton.getSocket('/game');
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
  }, []);



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
            <Chat/>
          </Col>
      </Row>
    </Layout>
  )
}

export default Game