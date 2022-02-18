import PropTypes from 'prop-types';
import ChatBody from './ChatBody';
import ChatForm from '../molecules/ChatForm';


function Chat({messages}) {
    return (
        <div className="chat-container">
            <div className="chat-header-container"></div>
            <div className="chat-body-container">
                <ChatBody messages={messages}/>
            </div>
            <div className="chat-form-container">
                <ChatForm/>
            </div>
        </div>
    );
}

Chat.propTypes = {
    messages: PropTypes.array.isRequired
};

export default Chat;