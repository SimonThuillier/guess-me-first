import PropTypes from 'prop-types';
import {Container} from "react-bootstrap";
import {useViewport} from "../useViewport";
import MyNavbar from "./organisms/MyNavbar";



const Layout = (props) => {
    const viewport = useViewport()
    return (<>
        <MyNavbar></MyNavbar>
        <div style={{position:"absolute", top:"48px", x:"0px", height:`${viewport[1] - 48}px`, width: "100%"}}>
            <Container fluid className={!!props.vcenter ? "vertical-center":""}>
                    {props.children} 
            </Container>
        </div> 
    </>)
}

Layout.propTypes = {
    vcenter: PropTypes.any
  };


export default Layout;
        
