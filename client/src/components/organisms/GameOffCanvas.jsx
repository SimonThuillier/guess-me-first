import {Offcanvas, Tabs, Tab} from "react-bootstrap";
import Chat from './Chat';
import GameScoreboard from '../molecules/GameScoreboard';


function GameOffCanvas({show, setShow, messages, chatSubmit, scoreboard}){

    console.log("scoreboard", scoreboard);

    let offcanvasBody = <div>?</div>;
    if(show === "chat"){
        offcanvasBody = <Chat messages={messages} onSubmit={chatSubmit}/>;
    }
    else if(show === "scoreboard"){
        offcanvasBody = <GameScoreboard scoreboard={scoreboard}/>;
    }

    return (
        <Offcanvas show={show!==false} onHide={()=>{setShow(false)}} placement="end">
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>
                    <Tabs 
                    defaultActiveKey="chat" 
                    className="mb-3"
                    activeKey={show}
                    onSelect={(k) => setShow(k)}
                    >
                        <Tab eventKey="chat" title="Chat">
                        </Tab>
                        <Tab eventKey="scoreboard" title="Scores" disabled={!scoreboard}>
                        </Tab>
                    </Tabs>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                {offcanvasBody}
            </Offcanvas.Body>
        </Offcanvas>
    )
} 

export default GameOffCanvas;