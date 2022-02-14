import ScrollToBottom from 'react-scroll-to-bottom';

function ChatBody(){

    const messages = [
        {user:"bot", text:"Hello, how can I help you?"},
    ]

    return (
        <div className="chat-body">
            <ScrollToBottom>
                {messages.map((message) => (
                    <li>
                        <span>{message.user}</span>
                        <p>{message.text}</p>
                    </li>
                ))
                }
            </ScrollToBottom>
        </div>
    );

}

export default ChatBody;