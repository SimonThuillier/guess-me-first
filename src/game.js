import { v4 as uuidV4 } from "uuid";
import { FRONTEND_URL } from './const.js';
import { ChatMessages } from './chat.js';

// to contourn reference circularity issue this proxy object is used to retrieve io from index.js at runtime
export const ioProxy = {
    io: null
}


function Game(creatorId, creatorName, parameters){
    this.creatorId = creatorId;
    this.creatorName = creatorName;
    this.parameters = parameters;

    this.gameId = `g_${uuidV4()}`;
    this.gameName = `partie de ${creatorName}`;

    this.players = new Set([creatorId]);

    this.path = `/game/${this.gameId}`;
    this.url = `${FRONTEND_URL}/game/${this.gameId}`;

    this.createdAt = new Date();
    this.startedAt = null;
    this.endedAt = null;

    this.chatMessages = ChatMessages();
}

Game.prototype.addPlayer = function(playerId){
    this.players.add(playerId);
    return this;
}

Game.prototype.removePlayer = function(playerId){
    this.players.delete(playerId);
    return this;
}

Game.prototype.playerCount = function(){
    return this.players.size;
}

Game.prototype.addMessage = function(senderId, senderName, message){
    const newMessage = this.chatMessages.addMessage(senderId, senderName, message);
    ioProxy.io.to(this.gamedId).emit('chat-messages', {
        gameId: this.gameId,
        messages: [{...newMessage}]}
        );
}

Game.prototype.getAllMessages = function(counterFrom=null){
    return this.chatMessages.getAll(counterFrom);
}

/**
 * retrieve public object data representing the game, which can be sent to server
 * @returns Object
 */
Game.prototype.getPublicData = function(){
    const data = {...this};
    data.players = Array.from(data.players);
    data.chatMessages = data.chatMessages.getAll();
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
        playerJoinGame: (playerId, gameId) => {
            const game = _games.get(gameId);
            if(!game){
                return;
            }
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


