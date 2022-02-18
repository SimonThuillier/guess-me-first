import PropTypes from 'prop-types';
import {Badge, Card} from "react-bootstrap";

function ChatMessage({id, senderId, senderName, message, createdAt}){
    console.log(message);
    // admin messages
    if(!senderId){
        return (
            <Card className="small-card-body" body><i>{message}</i></Card>
        )
    }

    // regular messages
    return (
        <Card className="small-card-body" body>
            <Badge bg="secondary">{senderName}</Badge>&nbsp;
            {message}
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

