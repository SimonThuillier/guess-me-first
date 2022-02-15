
import {Row, Col} from "react-bootstrap";

import { useLocalStorage } from '../../utils';
import Layout from '../Layout'
import HomeMenu from "../organisms/HomeMenu";


function Home() {
  const [playerName] = useLocalStorage("playerName", null);

  return (
    <Layout vcenter>
        <Row>
          <Col sm={2} md={4} />
          <Col sm={8} md={4}>
            <HomeMenu/>
          </Col>
          <Col sm={2} md={4} />
      </Row>
    </Layout>
  )
}

export default Home