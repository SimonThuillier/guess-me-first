import {Container} from "react-bootstrap";
import MyNavbar from "./organisms/MyNavbar";



const Layout = (props) => (
    <div>
        <MyNavbar></MyNavbar>
        <Container fluid>  
            {props.children}
        </Container>
    </div>
);


export default Layout;
        
