import {useEffect} from "react";
import { getPlayerName } from '../../utils';
import { sioSingleton } from '../../sio-client';

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
    <div>
        Game
    </div>
  )
}

export default Game