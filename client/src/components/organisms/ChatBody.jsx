import PropTypes from 'prop-types';
import ScrollToBottom from 'react-scroll-to-bottom';
import ChatMessage from '../atoms/ChatMessage.jsx';

function ChatBody({messages}){

    console.log("rerender chatBody", messages);

    return (
        <div className="chat-body">
            <ScrollToBottom className="chat-messages">
                {messages.map((message) => (
                    <ChatMessage key={message.id} {...message}/>
                ))
                }
            </ScrollToBottom>
        </div>
    );
}

ChatBody.propTypes = {
    messages: PropTypes.array.isRequired
};

export default ChatBody;