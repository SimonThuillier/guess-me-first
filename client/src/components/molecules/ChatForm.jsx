import PropTypes from 'prop-types';
import {Form, Button, Alert} from "react-bootstrap";

function ChatForm(props){


    return(
        <input placeholder="Envoyer un message" type="textarea" id="message" class="form-control"/>
    )
}

ChatForm.propTypes = {
    onSubmit: PropTypes.func
};

export default ChatForm;
        