// game code test script
import { games } from '../src/game.js';
console.clear();
console.log("creating test game");

let gameParameters = { 
    roundNumber: 4, 
    choicesPerRound: 4, 
    maxRoundTime: "30"
}

let player1 = {
    playerId: "player1.id",
    playerName: "player1.name",
}

// test in case of a solo game
const game1 = games.addGame(player1.playerId, player1.playerName, gameParameters);
console.log("game at creation: ", game1);

game1.startGame();
console.log("game after start: ", game1);
console.log("is player1 playing ?: ", game1.isPlayingPlayer(player1.playerId));
let currentRoundChoices = game1.currentRound.image.choices;
let currentRoundGoodChoice = game1.currentRound.image.name;

// submitting wrong guesses
console.log(currentRoundChoices);
currentRoundChoices.forEach(choice => {
    if (choice === currentRoundGoodChoice) {return;}
    console.log(`submitting wrong guess ${choice}`);
    game1.playerSubmitGuess(player1.playerId, choice);
    console.log("game after wrong guess: ", game1);
    console.log("isRoundOver: ", game1.currentRoundIsOver());
    console.log("player1 Data: ", game1.getPlayerData(player1.playerId));
});

// submitting good guess
console.log(`submitting good guess ${currentRoundGoodChoice}`);
game1.playerSubmitGuess(player1.playerId, currentRoundGoodChoice);
console.log("game after good guess: ", game1);
console.log("isRoundOver: ", game1.currentRoundIsOver());
console.log("player1 Data: ", game1.getPlayerData(player1.playerId));

// assuming currentRoundIsOver
console.log("going to next round");
game1.defineNextRound();
console.log("game after define next round: ", game1);

