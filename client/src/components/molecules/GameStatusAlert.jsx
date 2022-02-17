import PropTypes from 'prop-types';
import { Alert} from "react-bootstrap";

function GameStatusAlert(props){

    const {variant, heading, message, footer, onDismiss} = props;

    const _onDismiss = onDismiss || function(){};
    
    let _message = message;
    if(_message === "xhr poll error"){
        _message = "Impossible de se connecter au serveur !";
    }    

    return(
            <Alert show="1" variant={variant} onClose={_onDismiss} dismissible>
                <Alert.Heading>{heading}</Alert.Heading>
                <p>{_message}</p>
                <hr />
                <p className="mb-0">
                    {footer}
                </p>
            </Alert>
    )
}

GameStatusAlert.propTypes = {
    variant: PropTypes.string.isRequired,
    heading: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
    onDismiss: PropTypes.func
};

export default GameStatusAlert;
        