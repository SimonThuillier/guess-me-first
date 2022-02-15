import PropTypes from 'prop-types';
import {Container} from "react-bootstrap";
import MyNavbar from "./organisms/MyNavbar";



const Layout = (props) => (
    <div>
        <MyNavbar></MyNavbar>
        <Container fluid className={!!props.vcenter ? "vertical-center":""}>
            <div>
                {props.children}
            </div>  
        </Container>
    </div>
);

Layout.propTypes = {
    vcenter: PropTypes.any
  };


export default Layout;
        
