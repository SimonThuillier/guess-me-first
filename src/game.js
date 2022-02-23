import { v4 as uuidV4 } from "uuid";
import { FRONTEND_URL } from './const.js';
import { ChatMessages } from './chat.js';
import { getNImages, getNames } from './images.js';



function getCurrentTimestamp(){
    return Math.floor(Date.now() / 1000)
}

// this proxy allows game to push messages to clients using index sio game namespace channel
export const ioProxy = (() => {
    let _io = null;

    return {
        setIO: (io) => {
            if(!_io){
                _io = io;
            }
        },
        getIO: () => {
            return _io;
        }
    }
})();

// each started game can instanciate 
const asynchronousTaskIdManager = () => {

    return (() =>{
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
}

function Game(creatorId, creatorName, parameters){
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    // parameters are for example : { roundNumber: 4, choicesPerRound: 4, maxRoundTime: "30", secondsBetweenRound: 5}
    this.parameters = parameters;

    this.gameId = `g_${uuidV4()}`;
    this.gameName = `partie de ${creatorName}`;

    this.players = new Set([creatorId]);
    this.playersInfo = {};

    this.path = `/game/${this.gameId}`;
    this.url = `${FRONTEND_URL}/game/${this.gameId}`;

    this.createdAt = new Date();
    this.chatMessages = ChatMessages();
    this.startedAt = null;
    this.endedAt = null;

    // task id manager for time-triggered tasks
    this.taskIdManager = null;

    // active game Data
    this.baseGoodGuessBonus = 0;
    this._images = null;
    this.scoreboard = null;
    this.currentRound = null; 
    this.rankings = null;
    this.playersGameData = null;
}

Game.prototype.addPlayer = function(playerId, playerName){
    this.players.add(playerId);
    this.playersInfo[playerId] = {id: playerId, name: playerName};
    return this;
}

Game.prototype.removePlayer = function(playerId){
    this.players.delete(playerId);
    console.log(this.players);
    return this;
}

Game.prototype.playerCount = function(){
    return this.players.size;
}

Game.prototype.addMessage = function(senderId, senderName, message){
    const newMessage = this.chatMessages.addMessage(senderId, senderName, message);
    const messageData = {
        gameId: this.gameId,
        messages: [{...newMessage}]
    };

    return messageData;
}

Game.prototype.getAllMessages = function(counterFrom=null){
    return this.chatMessages.getAll(counterFrom);
}

// indicate weither game has started or not
Game.prototype.isStarted = function(){
    return !!this.startedAt;
}

// returns true if game isStarted and this player is a valid playing player
Game.prototype.isPlayingPlayer = function(playerId){
    return this.isStarted() && this.scoreboard.hasOwnProperty(playerId);
}

// returns true if all players have completed the round or if time for the round is up
Game.prototype.currentRoundIsOver = function(){
    if(!this.playersGameData){return false;}

    let allPlayersHaveCompletedRound = true;
    for (const [key, value] of Object.entries(this.playersGameData)) {
        if(!value.hasCompletedRound){
            allPlayersHaveCompletedRound = false;
            break;
        }
    }
    if(allPlayersHaveCompletedRound){
        return true;
    }
    // time's up logic
    return this.currentRound.endAt <= getCurrentTimestamp();
}

// returns true if all players have completed last round or if time for this round is up
Game.prototype.gameIsOver = function(){
    return this.currentRound.roundNumber >= this.parameters.roundNumber && this.currentRoundIsOver();
}

// get a list of player rankings once game is ended
Game.prototype.getRankings = function(){
    const scores = new Set();
    this.players.forEach(playerId => {
        scores.add(this.scoreboard[playerId].score);
    })
    if(scores.size < 1) return [];

    const rankings = [];

    while(scores.size > 0){
        let maxScore = Math.max(...Array.from(scores));
        scores.delete(maxScore);

        let ranking = {score: maxScore, players: []};
        this.players.forEach(playerId => {
            if(this.scoreboard[playerId].score !== maxScore) return;
            ranking.players.push({playerId: playerId, name: this.scoreboard[playerId].name});
        })
        rankings.push(ranking);
    }
    return rankings;
}

Game.prototype.startGame = function(){
    if(!!this.startedAt){return;}
    this.endedAt = null;
    this.startedAt = new Date();
    this.baseGoodGuessBonus = this.players.size;

    // scoreboard is public to all players
    this.scoreboard = {};
    this.players.forEach(playerId => {
        this.scoreboard[playerId] = {score: 0, name: this.playersInfo[playerId].name};
    });
    // see defineNextRound for data hydration of playersGameData
    this.playersGameData = {};

    // define images for the game and their choices
    this._images = getNImages(this.parameters.roundNumber);
    console.log("new images polled : ", this._images);
    for (const element of this._images) {
        element.choices = getNames(element.name, this.parameters.choicesPerRound);
    }

    this.taskIdManager = asynchronousTaskIdManager();

    /*if(!!ioProxy.getIO()){
        ioProxy.getIO().to(this.gameId).emit("hello", "does it work ?");
    }*/

    // define next round
    this.launchNextRound();
}

// called when all rounds have been completed 
Game.prototype.endGame = function(){
    // clear current asynchronous task
    if(!!this.taskIdManager.getId()){
        clearTimeout(this.taskIdManager.getId());
        this.taskIdManager.setId(null);
    }
    if(!!this.endedAt){return;}
    this.endedAt = new Date();

    let message = `La partie est finie !`;
    this.rankings = this.getRankings();
    console.log(this.rankings);
    // end message for solo game
    if(Object.keys(this.scoreboard).length === 1){
        message += ` Vous avez obtenu un score de ${this.rankings[0].score}`;
    }
    // end message for multi game
    else {
        const firstRank = this.rankings[0];
        if(firstRank.players.length === 1){
            message += ` ${firstRank.players[0].name} gagne avec un score de ${firstRank.score}`;
        }
        else if(firstRank.players.length === 2){
            message += ` ${' et '.join(firstRank.players.map(p => p.name))} gagnent ex-aequo avec un score de ${firstRank.score}`;
        }
        else {
            message += ` ${', '.join(firstRank.players.map(p => p.name))} gagnent ex-aequo avec un score de ${firstRank.score}`;
        }
    }
    const messageData = this.addMessage(null, 'BOT', message);
    ioProxy.getIO().to(this.gameId).emit('chatMessages', messageData);

    const gameData = {...this.getPublicData()};
    // we just don't send the chatMessages it's useless in this case
    gameData.chatMessages = null;
    // sending gameUpdate informing of the end game
    ioProxy.getIO().to(this.gameId).emit('gameUpdate', gameData);
}

Game.prototype.resetGame = function(){
    if(!this.startedAt){return;}
    // clear current asynchronous task
    if(!!this.taskIdManager && !!this.taskIdManager.getId()){
        clearTimeout(this.taskIdManager.getId());
        this.taskIdManager.setId(null);
    }

    this.startedAt = null;
    this.endedAt = null;

    // active game Data
    this.baseGoodGuessBonus = 0;
    this._images = null;
    this.scoreboard = null;
    this.currentRound = null; 
    this.rankings = null;
    this.playersGameData = null;

    const messageData = this.addMessage(null, 'BOT', 'Une nouvelle partie va être lancée !');
    ioProxy.getIO().to(this.gameId).emit('chatMessages', messageData);

    const gameData = {...this.getPublicData()};
    // we just don't send the chatMessages it's useless in this case
    gameData.chatMessages = null;
    ioProxy.getIO().to(this.gameId).emit('gameLoaded', {data: gameData});
    // sending gameUpdate informing of the end game
    // ioProxy.getIO().to(this.gameId).emit('gameUpdate', gameData);
}

// update internal game state for launching next round, returns true if nextround defined, false else (endgame)
Game.prototype.defineNextRound = function(){
    const roundNumber = this.currentRound ? this.currentRound.roundNumber + 1 : 1;
    // check if there should be a next round
    if (roundNumber > this.parameters.roundNumber) {return false;}

    const currentTimestamp = getCurrentTimestamp();

    this.currentRound = {
        roundNumber: roundNumber,
        image: this._images[roundNumber - 1],
        startAt : currentTimestamp + Number(this.parameters.secondsBetweenRound || 5),
        nextGoodGuessBonus: this.baseGoodGuessBonus
    }
    this.currentRound.endAt = this.currentRound.startAt + Number(this.parameters.maxRoundTime || 30);

    // playersGameData is private to each player
    // it will store informations about the game (for now only current round) for each player
    // thus it is reinitialized for each round
    this.players.forEach(playerId => {
        this.playersGameData[playerId] = {
            goodChoice: null,
            hasCompletedRound: false,
            wrongChoices: [],
        };
    });

    return true;
}

// launch next round sending messages to all players, using ioProxy to do so - MUST call defineNextRound
Game.prototype.launchNextRound = function(){
    // clear current asynchronous task
    if(!!this.taskIdManager.getId()){
        clearTimeout(this.taskIdManager.getId());
        this.taskIdManager.setId(null);
    }

    // goto next round if possible
    if (!this.defineNextRound()){
        this.endGame();
        return;
    }
    // send chat start notification to all players
    const messageData = this.addMessage(null, 'BOT', `Le tour ${this.currentRound.roundNumber} / ${this.parameters.roundNumber} va commencer !`);
    ioProxy.getIO().to(this.gameId).emit('chatMessages', messageData);

    // send gameUpdate notification and data to all players
    const gameData = {...this.getPublicData()};
    // we just don't send the chatMessages it's useless in this case
    gameData.chatMessages = null;
    ioProxy.getIO().to(this.gameId).emit('gameUpdate', gameData);

    // stage time'up automatic currentRound closing and next round launch
    const timeoutId = setTimeout((()=> {
        this.closeCurrentRound();
        this.launchNextRound();
    }).bind(this), (this.currentRound.endAt - getCurrentTimestamp() + 1)*1000);
    this.taskIdManager.setId(timeoutId);
}

// for closing current round automatically
Game.prototype.closeCurrentRound = function(){
    // clear current asynchronous task if needed
    if(!!this.taskIdManager.getId()){
        clearTimeout(this.taskIdManager.getId());
        this.taskIdManager.setId(null);
    }
    // all players who haven't answered lose half base good guess bonus
    for (const [playerId, value] of Object.entries(this.playersGameData)) {
        if(!value.hasCompletedRound){
            this.scoreboard[playerId].score -= (Math.max(1, Math.floor(this.baseGoodGuessBonus)));
        }
    }
    this.currentRound.endAt = getCurrentTimestamp();
    const messageData = this.addMessage(null, 'BOT', `Le tour ${this.currentRound.roundNumber} est terminé !`);
    ioProxy.getIO().to(this.gameId).emit('chatMessages', messageData);
}

// called upon player guess submission : returns weither choice is correct or not, returns null actions didn't have effect
Game.prototype.playerSubmitGuess = function(playerId, guess){
    if(!this.isStarted() && this.scoreboard.hasOwnProperty(playerId)){return null;}
    // if player has ended its turn nothing is done
    if(this.playersGameData[playerId].hasCompletedRound){return null;}
    // a choice can only be submitted once
    if(this.playersGameData[playerId].wrongChoices.includes(guess)){return null;}
    // then ok we can proceed
    if(this.currentRound.image.name === guess){
        this.scoreboard[playerId].score += (this.currentRound.nextGoodGuessBonus);
        this.currentRound.nextGoodGuessBonus -= 1;
        this.playersGameData[playerId].goodChoice = guess;
        this.playersGameData[playerId].hasCompletedRound = true;
        return true;
    } else {
        this.playersGameData[playerId].wrongChoices.push(guess);
        this.scoreboard[playerId].score -= (this.playersGameData[playerId].wrongChoices.length);
        return false;
    }

}

/**
 * retrieve public object data representing the game, which can be sent to server
 * @returns Object
 */
Game.prototype.getPublicData = function(){
    const data = {...this};
    data.players = Array.from(data.players);
    data.chatMessages = data.chatMessages.getAll();
    // offuscate active game data
    data._images = null;
    data.playersInfo = null;
    data.playersGameData = null;
    if(data.currentRound){
        data.currentRound = {...data.currentRound};
        data.currentRound.image = {...data.currentRound.image};
        data.currentRound.image.name = null;
    }
    Object.freeze(data);
    return data;
}

/**
 * retrieve player data representing the game, which can be sent to server
 * @returns Object
 */
 Game.prototype.getPlayerData = function(playerId){
    if(!this.isStarted() || !this.playersGameData || !this.playersGameData.hasOwnProperty(playerId)){return null;}
    const data = {...this.playersGameData[playerId]};
    Object.freeze(data);
    return data;
}

export const games = (() => {
    // map storing all ongoing games
    const _games = new Map();

    // map used as index for quickly retrieving games a player is into
    const _playerGamesIndex = new Map();
    function registerPlayer(playerId, gameId){
        if(!_playerGamesIndex.has(playerId)){
            let _thisPlayerGames = new Set();
            _thisPlayerGames.add(gameId);
            _playerGamesIndex.set(playerId, _thisPlayerGames);
        }
        else{
            let _thisPlayerGames = _playerGamesIndex.get(playerId);
            _thisPlayerGames.add(gameId);
        }
    }
    function unregisterPlayer(playerId, gameId){
        if(!_playerGamesIndex.has(playerId)){
            return;
        }
        let _thisPlayerGames = _playerGamesIndex.get(playerId);
        if (_thisPlayerGames.has(gameId)){
            _thisPlayerGames.delete(gameId);
        }
        if (_thisPlayerGames.size < 1){
            _playerGamesIndex.delete(playerId);
        }
    }

    // public
    return {
        gameCount: () => {
            return _games.size;
        },
        playerCount: () => {
            return _playerGamesIndex.size;
        },
        hasGame: (gameId) => {
            return _games.has(gameId);
        },
        getGame: (gameId) => {
            return _games.get(gameId);
        },
        addGame: (creatorId, creatorName, parameters) => {
            const newGame = new Game(creatorId, creatorName, parameters);
            _games.set(newGame.gameId, newGame);
            registerPlayer(creatorId, newGame.gameId)
            console.log(`After addGame there are now ${_playerGamesIndex.size} players on ${_games.size} games`);
            return newGame;
        },
        playerJoinGame: (playerId, playerName, gameId) => {
            const game = _games.get(gameId);
            if(!game){
                return;
            }
            game.addPlayer(playerId, playerName);
            registerPlayer(playerId, game.gameId);
            console.log(`After playerJoinGame there are now ${_playerGamesIndex.size} players on ${_games.size} games`);
        },
        playerLeaveGame: (playerId, gameId) => {
            unregisterPlayer(playerId, gameId);
            if(!!_games.get(gameId)){
                if(_games.get(gameId).removePlayer(playerId).playerCount() < 1){
                    console.log(`game ${gameId} is empty, removing it`);
                    _games.delete(gameId);
                }
            }
            console.log(`After playerLeaveGame there are now ${_playerGamesIndex.size} players on ${_games.size} games`);
        },

    };
})();


