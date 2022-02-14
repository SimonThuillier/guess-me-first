import {useEffect} from "react";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import { getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';
import Chat from '../organisms/Chat';

function Game() {

  useEffect(() => {
    const socket = sioSingleton.getSocket('/new-game');
    socket.off('connect').on('connect', () => {
      console.log('connected to new-game');
      socket.emit('hello', 'hello, i am ' + getPlayerName());
    });
    socket.connect();
    socket.emit('hello', 'hello, i am ' + getPlayerName());
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