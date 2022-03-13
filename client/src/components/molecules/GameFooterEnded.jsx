import PropTypes from 'prop-types';
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button, Card} from "react-bootstrap";
import { FaCopy } from 'react-icons/fa';
import { useLocalStorage, getPlayerId } from '../../utils';
import NameForm from './NameForm'


/**
 * game footer after its end
 * @param {*} props 
 * @returns 
 */
function GameFooterEnded(props) {

  const {gameData, onReset} = props;
  const {scoreboard, rankings} = gameData;

  let message = `La partie est finie !`;

  // end message for solo game
  if(Object.keys(scoreboard).length === 1){
    message += ` Votre score est de ${rankings[0].score}`;
  }
  // end message for multi game
  else {
    const firstRank = rankings[0];
    const firstScore = firstRank.score;
    const myScore = scoreboard[getPlayerId()].score;

    if(myScore === firstScore){
      if(firstRank.players.length === 1){
        message += ` Vous avez gagné avec un score de ${myScore} !`;
      }
      else {
        message += ` Vous gagnez ex-aequo avec un score de ${myScore} !`;
      }
    }
    else {
      message += ` Votre score est de ${myScore}`;
    }
  }

  if(gameData.creatorId !== getPlayerId()){
    return (
      <div className="game-footer-container">
            <div className="game-footer-container">
                <h3>{message}</h3>
                <h5>Le créateur de la partie peut en lancer une autre</h5>
            </div>
      </div>
    );
  }

  return (
    <div className="game-footer-container">
            <div className="game-footer-container">
                <h3>{message}</h3>
                <div className="game-pending-container">
                <Card>
                  <Card.Body>
                    <Button onClick={onReset} variant="primary">Lancer une nouvelle partie</Button>
                  </Card.Body>
                </Card>
                <div></div>
            </div>
            </div>
    </div>
  );
}

GameFooterEnded.propTypes = {
    gameData: PropTypes.object.isRequired,
    onReset: PropTypes.func,
};

export default GameFooterEnded



