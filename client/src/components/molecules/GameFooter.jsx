import {useEffect, useState} from "react";
import {Button} from "react-bootstrap";
import {getCurrentTimestamp} from '../../utils.js';

const textualRemainingTime = (remainingTime) => {
    if(remainingTime <= 0){
        return "Temps écoulé !";
    }
    const minutes = Math.floor(remainingTime/60);
    const seconds = remainingTime%60;
    if(minutes < 1){
        return `${seconds}s`;
    }

    return `${minutes}m ${seconds}s`;
}

// to handle safely dynamicIntervalId in gameFooter 
// NB : if several gameFooter are rendered, the intervalId will be shared -> this can lead to unexpected behavior
// to solve it a factory of this manager should be implemented, however it's not necessary for this project
const intervalIdManager = (() =>{
    let internalId = null;

    return {
        setId: (id) => {
            internalId = id;
        },
        getId: () => {
            return internalId;
        }
    }
})();

function GameFooter({choices, onGuess, roundNumber, roundData, startAt, endAt}){
    const {hasCompletedRound, goodChoice, wrongChoices} = roundData;
    const [dynamicData, setDynamicData] = useState({
        displayedMessage: "Le tour va bientôt commencer",
        remainingTimeForStart: Math.max(startAt-getCurrentTimestamp(), 0),
        remainingTime: Math.max(endAt-getCurrentTimestamp(), 0)
    });

    const clearDynamicDisplayInterval = () => {
        const intervalId = intervalIdManager.getId();
        if(!!intervalId){
            clearInterval(intervalId);
            intervalIdManager.setId(null);
        }
    }

    // dynamic display effect
    useEffect(() => {
        if(hasCompletedRound){
            const newDynamicData = {...dynamicData};
            newDynamicData.displayedMessage = "Bien joué ! les autres joueurs finissent leur tour...";
            newDynamicData.remainingTime = -1;
            setDynamicData(newDynamicData);
            return;
        }

        const timeDaemon = () => {
            if(hasCompletedRound){
                clearDynamicDisplayInterval();
                return;    
            }

            const currentTime = getCurrentTimestamp();
            const remainingTime = endAt-currentTime;

            const newDynamicData = {...dynamicData};
            newDynamicData.remainingTime = Math.max(endAt-currentTime, 0);
            newDynamicData.remainingTimeForStart = Math.max(startAt-getCurrentTimestamp(), 0);

            if (newDynamicData.remainingTimeForStart > 0){
                if(roundNumber === 1){
                    newDynamicData.displayedMessage = `Grattez le cercle qui va apparaître pour le diviser et deviner l'image cachée !`;
                }
                else {
                    newDynamicData.displayedMessage = `Le tour ${roundNumber} va bientôt commencer`;
                }
            }
            else if(remainingTime > 0){
                newDynamicData.displayedMessage = `Devinez bien ! il vous reste ${textualRemainingTime(remainingTime)}`;
            }
            else {
                newDynamicData.displayedMessage = `${textualRemainingTime(remainingTime)}`;
                clearDynamicDisplayInterval();
            }
            setDynamicData(newDynamicData);
        }

        timeDaemon();
        const intervalId = setInterval(timeDaemon, 1000);
        intervalIdManager.setId(intervalId);
        
        return () => {
            clearDynamicDisplayInterval();
        }
    }, [roundNumber, hasCompletedRound, startAt, endAt]);

    const disabledChoices = dynamicData.remainingTimeForStart > 0 || hasCompletedRound || dynamicData.remainingTime === 0;


    return (
        <div className="game-footer-container">
            <div className="game-footer-container">
                <h3>{dynamicData.displayedMessage}</h3>
            </div>
            <div className="game-footer-choices-container">
                {choices.map((choice, index) => {

                    const disabled = disabledChoices || choice===goodChoice || wrongChoices.includes(choice);
                    let variant = "outline-secondary";
                    if(choice===goodChoice){
                        variant = "outline-success";
                    }
                    else if(wrongChoices.includes(choice)){
                        variant = "outline-danger";
                    }

                    return (
                        <div className="game-footer-choice-container" key={`${roundNumber}-${choice}`}>
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