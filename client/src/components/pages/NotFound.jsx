import PropTypes from 'prop-types';
import {useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';

function NotFound(props) {

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
      }, 2500);
    }, []);

  return (
    <Layout vcenter>
        <Row>
          <Col md={4}/>
          <Col md={4} >
            <h1>{!!props.game ? "Partie non trouvée": "Page non trouvée"}</h1>
            <hr />
            <h3>Vous allez être redirigé vers le <Link to={"/"}>menu</Link>...</h3>
          </Col>
          <Col md={4}/>
      </Row>
    </Layout>
  )
}

NotFound.propTypes = {
  game: PropTypes.any,
};

export default NotFound