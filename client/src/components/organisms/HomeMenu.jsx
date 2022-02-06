import {useState} from "react";
import {Button, Row, Col} from "react-bootstrap";
import { useLocalStorage } from '../../utils';
import NameForm from '../molecules/NameForm'



function HomeMenu() {
  const [playerName, setPlayerName] = useLocalStorage("playerName", null);
  const [editingPlayerName, setEditingPlayerName] = useState(!playerName);

  const onSubmitPlayerName = (playerName) => {
    setPlayerName(playerName);
    setEditingPlayerName(false);
  }

  if (editingPlayerName){
    return (
        <Row className="menu-row">
            <NameForm onSubmit = {onSubmitPlayerName}/>
        </Row>
        
      );
  }

  console.log("home playerName", playerName);

  return (
    <div>
        <Row className="menu-row">
            <Col>
            <h1>Bonjour {playerName}</h1>&nbsp;
                <Button variant="light" onClick={()=>{setEditingPlayerName(true);}}>
                    changer
                </Button>
            </Col>
        </Row>
        <Row className="menu-row">
            <div className="d-grid gap-2">
                <Button variant="primary" size="lg">
                    Creer une partie
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