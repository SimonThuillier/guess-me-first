import PropTypes from 'prop-types';
import ChatBody from './ChatBody';
import ChatForm from '../molecules/ChatForm';


function Chat({messages, onSubmit}) {
    return (
        <div className="chat-container">
            <div className="chat-header-container"></div>
            <div className="chat-body-container">
                <ChatBody messages={messages}/>
            </div>
            <div className="chat-form-container">
                <ChatForm onSubmit={onSubmit}/>
            </div>
        </div>
    );
}

Chat.propTypes = {
    messages: PropTypes.array.isRequired,
    onSubmit: PropTypes.func.isRequired
};

export default Chat;