import {useEffect, useState} from "react";
import PropTypes from 'prop-types';
import { makeObservable } from '../../utils.js';



const messageStore = makeObservable(""); 

// singleton message state for all chat forms 
function useMessage() {
    const [message, _setMessage] = useState(messageStore.get());

    useEffect(() => {
        return messageStore.subscribe(_setMessage);
    }, []);

    return [message, (_message) => messageStore.set(_message)];
}


function ChatForm({onSubmit}){
    const [message, setMessage] = useMessage();

    const onKeyDown = (e) => {
        if(!e || !e.key) return;
        // console.log(e.key, onSubmit);
        if (e.key === "Enter"){
            const cleanedMessage = (message || "").trim();
            if(cleanedMessage.length < 1) return;
            onSubmit(cleanedMessage);
            setMessage("");
        }
    }

    return(
        <input 
        id="chat-form-message"
        placeholder="Envoyer un message" 
        type="textarea"  
        className="form-control"
        value={message}
        onChange={(e)=>{setMessage(e.target.value)}}
        onKeyDown={onKeyDown}
        />
    )
}

ChatForm.propTypes = {
    onSubmit: PropTypes.func
};

export default ChatForm;
        