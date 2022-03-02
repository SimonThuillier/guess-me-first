import PropTypes from 'prop-types';
import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button, Card} from "react-bootstrap";
import { FaCopy } from 'react-icons/fa';
import { useLocalStorage, getPlayerId } from '../../utils';
import NameForm from '../molecules/NameForm'


/**
 * this panel handles game before it starts
 * @param {*} props 
 * @returns 
 */
function GamePanelPending(props) {

  const [copyButtonVariant, setCopyButtonVariant] = useState("secondary");
  const {gameData, onStart} = props;

  if(gameData.creatorId !== getPlayerId()){
    return (
      <div className="game-pending-container">
          <Card>
            <Card.Header as="h5">En attente du début de partie</Card.Header>
            <Card.Body>
              Vous pouvez échanger sur le chat pendant ce temps !
            </Card.Body>
          </Card>
      </div>
    );
  }

  const onCopyButtonClick = () => {
    navigator.clipboard.writeText(gameData.url);
    setCopyButtonVariant("success");
    setTimeout(() => {
      setCopyButtonVariant("secondary");
    }, 800);
  }

  return (
    <div className="game-pending-container">
        <Card>
          <Card.Header as="h5">Invitez d'autres joueurs avec ce lien</Card.Header>
          <Card.Body>
            {gameData.url}&nbsp;&nbsp;
            <Button title="Copiez le lien" onClick={onCopyButtonClick} variant={copyButtonVariant}><FaCopy /></Button>
          </Card.Body>
        </Card>
        <div style={{paddingTop: "2vh"}}>
          <Button onClick={onStart} variant="primary">Lancer la partie !</Button>
        </div>
    </div>
  );
}

GamePanelPending.propTypes = {
    gameData: PropTypes.object.isRequired,
    onStart: PropTypes.func.isRequired,
};

export default GamePanelPending



