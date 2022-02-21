import {Button } from "react-bootstrap";


function GameFooter({choices, onGuess, roundData}){

    console.log("roundData", roundData);
    // roundData : goodChoice: null, hasCompletedRound: false, wrongChoices: ["astley"]
    const {hasCompletedRound, goodChoice, wrongChoices} = roundData;

    return (
        <div className="game-footer-container">
            <div className="game-footer-choices-container">
                {choices.map((choice, index) => {

                    const disabled = hasCompletedRound || choice===goodChoice || wrongChoices.includes(choice);
                    let variant = "outline-secondary";
                    if(choice===goodChoice){
                        variant = "outline-success";
                    }
                    else if(wrongChoices.includes(choice)){
                        variant = "outline-danger";
                    }

                    return (
                        <div className="game-footer-choice-container" key={choice}>
                            <Button 
                                variant={variant}
                                disabled={disabled}
                                onClick={() => {onGuess(choice)}}
                                >
                                    {choice}
                            </Button>
                        </div>  
                    );
                })}
            </div>
        </div>
    )

} 

export default GameFooter