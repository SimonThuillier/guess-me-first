import { Navbar, Container} from "react-bootstrap";
import { useNavigate } from "react-router-dom";


const MyNavbar = function(){

  const navigate = useNavigate();

  return (
  <Navbar bg="dark" variant="dark" fixed="top">
    <Container>
      <Navbar.Brand onClick={()=>{navigate("/")}}>
      Guess me First !
      </Navbar.Brand>
    </Container>
  </Navbar>
  )
}



export default MyNavbar;