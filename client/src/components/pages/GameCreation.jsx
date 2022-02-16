import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import {Row, Col} from "react-bootstrap";

import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Layout from '../Layout';
import GameCreationAlert from '../molecules/GameCreationAlert';

function GameCreation() {

  const [ownedGameConfiguration] = useLocalStorage("ownedGameConfiguration",null);
  const [gameCreationStatus, setGameCreationStatus] = useState("gameCreationStatus",{status: "CONNECTING", message:null});
  // for fast charging new game data 
  const [newGameData, setNewGameData] = useLocalStorage("newGameData",null);
  const navigate = useNavigate();

  const onConnect = () => {
    const socket = sioSingleton.getSocket('/game');

    socket.on('gameCreated', (...args) => {
      console.log('gameCreated', args);
      const params = args[0];
      setNewGameData(params);
      navigate(params.path);
    });


    socket.emit('createGame', {
      creatorId: getPlayerId(), 
      creatorName: getPlayerName(), 
      parameters: ownedGameConfiguration  
    });

    setGameCreationStatus({status: "CREATING", message:null});
  }

  const onConnectFailed = (err) => {
    setGameCreationStatus({status: "ERROR", message:err.message});
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

  if (gameCreationStatus.status === "ERROR"){

    const onAlertDismiss = () => {
      sioSingleton.getDefaultSocket().disconnect();
      sioSingleton.getSocket('/game').disconnect();
      navigate('/');
    }

    return(
      <Layout vcenter>
        <Row>
          <Col sm={2} md={4}/>
          <Col sm={8} md={4}>
            <GameCreationAlert
              variant="danger"
              heading="Erreur lors de la création de la partie"
              message={gameCreationStatus.message}
              onDismiss={onAlertDismiss}
              footer="Reconnexion en cours... Fermez cette alerte si vous souhaitez retourner au menu."
            />
          </Col>
          <Col sm={2} md={4}/>
        </Row>
      </Layout>
    )
  }


  // nominal case
  return (
    <Layout vcenter>
        <Row>
          <Col md={4}/>
          <Col md={4} >
            <h1>Création de la partie...</h1>
          </Col>
          <Col md={4}/>
      </Row>
    </Layout>
  )
}

export default GameCreation