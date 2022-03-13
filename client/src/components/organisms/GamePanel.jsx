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
    <div id="game-panel-container" className="game-panel-container">
      <GameImage url={url} startAt={startAt} />
    </div>  
  );
}

GamePanel.propTypes = {
    url: PropTypes.string.isRequired,
    startAt: PropTypes.number.isRequired,
};

export default GamePanel



