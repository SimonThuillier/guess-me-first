import {useEffect} from "react";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import { useLocalStorage, getPlayerId, getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Chat from '../organisms/Chat';

function Game() {

  const [ownedGameConfiguration, setOwnedGameConfiguration] = useLocalStorage("ownedGameConfiguration",null);

  useEffect(() => {
    const socket = sioSingleton.getSocket('/game');
    socket.off('connect').on('connect', () => {
      console.log('connected to new-game');
      socket.emit('createGame', {
        creatorId: getPlayerId(), 
        creatorName: getPlayerName(), 
        parameters: ownedGameConfiguration  
      });
    });
    socket.connect();
  }, []);


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