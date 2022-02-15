import {useEffect} from "react";
import { useNavigate, Link } from "react-router-dom";
import {Row, Col} from "react-bootstrap";
import Layout from '../Layout';

function NotFound() {

  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/");
      }, 2000);
    }, []);

  return (
    <Layout vcenter>
        <Row>
          <Col md={4}/>
          <Col md={4} >
            <h1>Page non trouvée</h1>
            <hr />
            <h3>Vous allez être redirigé vers le <Link to={"/"}>menu</Link>...</h3>
          </Col>
          <Col md={4}/>
      </Row>
    </Layout>
  )
}

export default NotFound