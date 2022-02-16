import {useState} from "react";
import { useNavigate } from "react-router-dom";
import {Button, Row, Col} from "react-bootstrap";
import { useLocalStorage } from '../../utils';
import NameForm from '../molecules/NameForm'



function HomeMenu() {
  const [playerName, setPlayerName] = useLocalStorage("playerName", null);
  const [editingPlayerName, setEditingPlayerName] = useState(!playerName);

  const navigate = useNavigate();

  const onSubmitPlayerName = (playerName) => {
    setPlayerName(playerName);
    setEditingPlayerName(false);
  }

  const playerRow = editingPlayerName? 
        <Row>
            <NameForm onSubmit = {onSubmitPlayerName}/>
        </Row> :
        <Row>
            <Col>
            <h1>Bonjour {playerName}</h1>&nbsp;
                <Button variant="light" onClick={()=>{setEditingPlayerName(true);}}>
                    changer
                </Button>
            </Col>
        </Row>

  if(!playerName || playerName === ""){
      return (<div>{playerRow}</div>);
  }    

  return (
    <div>
        {playerRow}
        <Row className="menu-row">
            <div className="d-grid gap-2">
                <Button variant="primary" size="lg" onClick={() => navigate('/game-configuration')}>
                    Créer une partie
                </Button>
            </div>
        </Row>
        <Row className="menu-row">
            <div className="d-grid gap-2">
                <Button variant="success" size="lg">
                    Rejoindre une partie
                </Button>
            </div>
        </Row>
    </div>
  );
}

export default HomeMenu