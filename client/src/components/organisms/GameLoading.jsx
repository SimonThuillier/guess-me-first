import PropTypes from 'prop-types';
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';
import GameStatusAlert from '../molecules/GameStatusAlert';

const GameLoading = (props) => {
  
  const {gameStatus} = props;

  let subComponent = <h1>Chargement de la partie...</h1>;

  // console.log(gameStatus);

  if (gameStatus.status === "ERROR"){
      subComponent = <GameStatusAlert
        variant="danger"
        heading="Erreur lors du chargement de la partie"
        message={gameStatus.message}
        onDismiss={props.onAlertDismiss}
        footer="(Re)Connexion en cours... Fermez cette alerte si vous souhaitez retourner au menu." />
  }

  return (
    <Layout vcenter>
        <Row>
          <Col md={4}/>
          <Col md={4} >
            {subComponent}
          </Col>
          <Col md={4}/>
      </Row>
    </Layout>
  )
};

GameLoading.propTypes = {
  gameStatus: PropTypes.object.isRequired,
  onAlertDismiss: PropTypes.func
};

export default GameLoading;