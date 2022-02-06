import { Navbar, Container} from "react-bootstrap";


const MyNavbar = () => (
  <Navbar bg="dark" variant="dark">
    <Container>
      <Navbar.Brand href="/">
      Guess me First !
      </Navbar.Brand>
    </Container>
  </Navbar>
);

export default MyNavbar;