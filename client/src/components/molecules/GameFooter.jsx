import {Button } from "react-bootstrap";


function GameFooter({choices, onGuess}){




    return (
        <div className="game-footer-container">
            <div className="game-footer-choices-container">
                {choices.map((choice, index) => {
                    return (
                        <Button variant="outline-secondary" onClick={() => {onGuess(choice)}}>
                            {choice}
                        </Button>
                    );
                })}
            </div>
        </div>
    )

} 

export default GameFooter