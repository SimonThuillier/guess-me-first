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
function GamePanel(props) {
  const {gameData, onGuess, roundData} = props; 
  // once game has started there is a current round
  const {currentRound} = gameData;
  const roundStartAt = currentRound.startAt;
  
  console.log('gameData in panel', gameData);

  return (
    <div className="game-panel-container">
      <GameImage url={currentRound.image.url} started={false} />
    </div>  
  );
}

GamePanel.propTypes = {
    gameData: PropTypes.object.isRequired,
    onGuess: PropTypes.func.isRequired,
};

export default GamePanel



