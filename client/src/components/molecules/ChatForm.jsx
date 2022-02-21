import {useEffect, useState} from "react";
import PropTypes from 'prop-types';

function ChatForm({onSubmit}){
    // beware when using functions as state, it should be a function returned by a first function 
    // because of lazy loading feature of react (see https://reactjs.org/docs/hooks-reference.html#usestate)
    const [onKeyDown, setOnKeyDown] = useState(() => () => {});
    const [onFocus, setOnFocus] = useState(() => () => {});
    const [onBlur, setOnBlur] = useState(() => () => {});

    const onKeyDown2 = (e) => {
        if(!e || !e.key) return;
        // console.log(e.key, onSubmit);
        if (e.key === "Enter"){
            const message = (e.target.value || "").trim();
            if(message.length < 1) return;
            onSubmit(message);
            e.target.value = null;
        }
    }

    // TODO : probably utterly useless , delete later 
    useEffect(()=> {
        document.removeEventListener('keydown', onKeyDown);
        const _onKeyDown = () => (e) => {
            if(!e || !e.key) return;
            console.log(e.key, onSubmit);
            if (e.key === "Enter"){
                const message = (e.target.value || "").trim();
                if(message.length < 1) return;
                onSubmit(message);
                e.target.value = null;
            }
        }
        setOnKeyDown(_onKeyDown);

        const _onFocus = () => (e) => {
            console.log("focus", onKeyDown);

            console.log(document.getElementById("chat-form-message"));

            document.getElementById("chat-form-message").addEventListener("keydown", onKeyDown);
        }
        setOnFocus(_onFocus);

        const _onBlur = () => (e) => {
            console.log("blur");
            document.getElementById("chat-form-message").removeEventListener("keydown", onKeyDown);
        }
        setOnBlur(_onBlur);

    },[onSubmit]);

    // component end cleaning
    useEffect(() => {
        return () => {
            if(!!document.getElementById("chat-form-message")){
                document.getElementById("chat-form-message").removeEventListener('keydown', onKeyDown);
            }
        }
    });

    return(
        <input 
        id="chat-form-message"
        placeholder="Envoyer un message" 
        type="textarea"  
        class="form-control"
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown2}
        />
    )
}

ChatForm.propTypes = {
    onSubmit: PropTypes.func
};

export default ChatForm;
        