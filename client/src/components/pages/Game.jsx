import {useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Chat from '../organisms/Chat';
import GameLoading from "../organisms/GameLoading";

function Game() {
  // for fast loading new game data in case you just created it
  const [newGameData, setNewGameData] = useLocalStorage("newGameData",null);
  let gameData = null;

  useEffect(() => {
    console.log(location.pathname);


    const socket = sioSingleton.getSocket('/game');
    socket.off('connect').on('connect', () => {
      
      
    });
    socket.connect();
  }, []);

  if(!gameData){
    return (<GameLoading/>);
  }







  return (
    <Layout>
        <Row>
          <Col md={8} >Game</Col>
          <Col md={4}>
            <Chat/>
          </Col>
      </Row>
    </Layout>
  )
}

export default Game