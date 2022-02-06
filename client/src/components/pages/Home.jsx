
import {Row, Col} from "react-bootstrap";

import { useLocalStorage } from '../../utils';
import Layout from '../Layout'
import HomeMenu from "../organisms/HomeMenu";


function Home() {
  const [playerName] = useLocalStorage("playerName", null);

  return (
    <Layout>
        <Row>
          <Col></Col>
          <Col>
            <HomeMenu/>
          </Col>
          <Col></Col>
      </Row>
    </Layout>
  )
}

export default Home