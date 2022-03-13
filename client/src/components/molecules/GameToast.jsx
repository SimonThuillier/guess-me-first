import {Button, ToastContainer, Toast, Card} from "react-bootstrap";
import { useViewport } from "../../useViewport";
import ChatMessage from "../atoms/ChatMessage";
import ChatForm from "../molecules/ChatForm";

function GameToast({messages, setShowOffCanvas, hasStarted, hasEnded, chatSubmit}){

    const viewport = useViewport();

    let headerComponents = [
        <Button 
          key="chat-button"
          variant="primary"
          onClick={() => {setShowOffCanvas("chat")}}>
          Chat
        </Button>
    ];

    if(hasStarted){
    headerComponents.push(
        <Button 
            key="scores-button"
            variant="primary"
            onClick={() => {setShowOffCanvas("scoreboard")}}>
            Scores
        </Button>
    )
    }

    // if game has started and viewport width is too small, only the chat button is displayed
    // to prevent toast from being displayed in front of choices
    if(hasStarted && !hasEnded & viewport[0] < 1250){
        return (
            <ToastContainer className="p-1" position="bottom-end">
              <Toast>
                <Toast.Header closeButton={false}>
                    <div style={{display:"flex",justifyContent:"space-around", width: "100%"}}>
                        {headerComponents}
                    </div>
                </Toast.Header>
              </Toast>
            </ToastContainer>
        )
    }

    let toastBodyComponent = <Card className="small-card-body" body><i>Aucun message</i></Card>
    if(messages.length > 0){
        toastBodyComponent = <ChatMessage abridged={75} {...messages[messages.length-1]}/>
    }

    return (
        <ToastContainer className="p-3" position={hasStarted?"bottom-end":"bottom-center"}>
          <Toast>
            <Toast.Body>
                {toastBodyComponent}
                <ChatForm onSubmit={chatSubmit}/>
            </Toast.Body>
            <Toast.Header closeButton={false}>
                <div style={{display:"flex",justifyContent:"space-around", width: "100%"}}>
                    {headerComponents}
                </div>
            </Toast.Header>
          </Toast>
        </ToastContainer>
    )
} 

export default GameToast;