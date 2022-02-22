import PropTypes from 'prop-types';
import {Badge, Card} from "react-bootstrap";

function ChatMessage({id, senderId, senderName, message, createdAt, abridged}){

    let actualMessage = message;

    if(!!abridged){
        if(message.length > abridged){
            actualMessage = message.substring(0,abridged) + "...";
        }
    }

    // admin messages
    if(!senderId){
        return (
            <Card className="small-card-body chat-message" body><i>{actualMessage}</i></Card>
        )
    }

    // regular messages
    return (
        <Card className="small-card-body chat-message" body>
            <Badge bg="secondary">{senderName}</Badge>&nbsp;
            {actualMessage}
        </Card>
    )
}

ChatMessage.propTypes = {
    id: PropTypes.number.isRequired,
    senderId: PropTypes.string,
    senderName: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
};

export default ChatMessage;

