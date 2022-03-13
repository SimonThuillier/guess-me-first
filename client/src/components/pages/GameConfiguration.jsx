
import {Row, Col} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from '../../utils';
import Layout from '../Layout'
import GameConfigurationForm from "../organisms/GameConfigurationForm";


function GameConfiguration() {
  const [ownedGameConfiguration, setOwnedGameConfiguration] = useLocalStorage("ownedGameConfiguration",{
    roundNumber: 4,
    choicesPerRound: 4,
    maxRoundTime: "30",
    secondsBetweenRound: 5
    });

  const navigate = useNavigate();

  const handleSubmit = (data) => {
    setOwnedGameConfiguration(data);
    navigate('/new-game');
  }  

  return (
    <Layout vcenter>
        <Row>
          <Col sm={2} md={4}></Col>
          <Col sm={8} md={4}>
            <GameConfigurationForm initialData={ownedGameConfiguration} onSubmit={handleSubmit}/>
          </Col>
          <Col sm={2} md={4}></Col>
      </Row>
    </Layout>
  )
}

export default GameConfiguration;