import PropTypes from 'prop-types';
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button, Row, Col} from "react-bootstrap";
import { useLocalStorage } from '../../utils';
import GameImage from '../molecules/GameImage';


/**
 * this Panel handles ongoing game after it started and before it ends
 * @param {*} props 
 * @returns 
 */
function GamePanel({url, startAt}) {

  return (
    <div className="game-panel-container">
      <GameImage url={url} startAt={startAt} />
    </div>  
  );
}

GamePanel.propTypes = {
    gameData: PropTypes.object.isRequired,
    onGuess: PropTypes.func.isRequired,
};

export default GamePanel



