
import {Row, Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from '../../utils';
import Layout from '../Layout'
import GameConfigurationForm from "../organisms/GameConfigurationForm";


function GameConfiguration() {
  const [ownedGameConfiguration, setOwnedGameConfiguration] = useLocalStorage("ownedGameConfiguration",{
    roundNumber: 4,
    choicesPerRound: 4
    });

  const navigate = useNavigate();

  const handleSubmit = (data) => {
    console.log(data);
    setOwnedGameConfiguration(data);
    navigate('/game');
  }  

  return (
    <Layout>
        <Row>
          <Col></Col>
          <Col>
            <GameConfigurationForm initialData={ownedGameConfiguration} onSubmit={handleSubmit}/>
          </Col>
          <Col></Col>
      </Row>
    </Layout>
  )
}

export default GameConfiguration;