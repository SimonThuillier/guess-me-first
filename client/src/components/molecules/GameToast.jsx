import {Button, ToastContainer, Toast, Card} from "react-bootstrap";
import ChatMessage from "../atoms/ChatMessage";

function GameToast({messages, setShowOffCanvas, hasStarted}){

    let toastBodyComponent = <Card className="small-card-body" body><i>Aucun message</i></Card>
    if(messages.length > 0){
        const abridgedMessage = messages[messages.length-1];
        toastBodyComponent = <ChatMessage abridged={75} {...messages[messages.length-1]}/>
    }

    let headerComponents = [
              <Button 
                variant="primary"
                onClick={() => {setShowOffCanvas("chat")}}>
                Chat
              </Button>
    ];

    if(hasStarted){
        headerComponents.push(
            <Button 
                variant="primary"
                onClick={() => {setShowOffCanvas("scoreboard")}}>
                Scores
            </Button>
        )
    }

    return (
        <ToastContainer className="p-3" position="bottom-center">
          <Toast>
            <Toast.Body>{toastBodyComponent}</Toast.Body>
            <Toast.Header closeButton={false}>
                <div style={{display:"flex","justify-content":"space-around", width: "100%"}}>
                    {headerComponents}
                </div>
            </Toast.Header>
          </Toast>
        </ToastContainer>
    )
} 

export default GameToast;