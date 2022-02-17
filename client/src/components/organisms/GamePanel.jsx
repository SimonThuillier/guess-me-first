import PropTypes from 'prop-types';
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button, Row, Col} from "react-bootstrap";
import { useLocalStorage } from '../../utils';
import NameForm from '../molecules/NameForm'
import GamePanelPending from './GamePanelPending'


function GamePanel(props) {

  const {gameData} = props;  

  if (!gameData.startedAt){
      return <GamePanelPending gameData={gameData}/>;
  }

  return (
    <div>
        game
    </div>
  );
}

GamePanel.propTypes = {
    gameData: PropTypes.object.isRequired,
    gameStatus: PropTypes.object.isRequired,
};

export default GamePanel



