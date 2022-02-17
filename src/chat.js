
/**
 * 
 * @param {Number|null} id if null means that it's an automatic message
 * @param String senderId 
 * @param String senderName 
 * @param String message 
 */
function ChatMessage(id, senderId, senderName, message){
    this.id = id;
    this.senderId = senderId;
    this.senderName = senderName;
    this.message = message;
    this.createdAt = new Date();
}

export const ChatMessages = () => {
    const chatMessage = (() => {
        // map storing all chats for one game
        const _messages = [];
    
        var counterIncrementer = (() => {
            let counter = 0;
            return function() {
                return ++counter;
            };
        })();
    
        // public
        return {
            messageCount: () => {
                return _messages.size;
            },
            addMessage: (senderId, senderName, message) => {
                const newMessage = new ChatMessage(counterIncrementer(), senderId, senderName, message);
                _messages.push(newMessage);
                return newMessage;
            },
            getAll(counterFrom=null){
                let messages = [..._messages];
                if(counterFrom !== null){
                    messages = messages.filter(message => message.id >= counterFrom);
                }
                return messages;
            }
        };
    })();
    return chatMessage;
}