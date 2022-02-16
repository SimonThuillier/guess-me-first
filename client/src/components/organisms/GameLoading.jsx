import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';

const GameLoading = () => (
    <Layout vcenter>
        <Row>
          <Col md={4}/>
          <Col md={4} >
            <h1>Chargement de la partie...</h1>
          </Col>
          <Col md={4}/>
      </Row>
    </Layout>
);

export default GameLoading;