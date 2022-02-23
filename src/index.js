import cors from 'cors';
import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io';

import { HOSTNAME, PORT, CUSTOM_HEADER_KEY, FRONTEND_URL } from './const.js';
import { ioProxy, games } from './game.js';


// see https://socket.io/get-started/chat for basic configuration
// and https://socket.io/docs/v3/handling-cors/ for dealing with CORS (remember its purpose isn't to bother you but to make the web safer :))
const app = express();
app.use(cors());
app.use(express.static('public'));
app.options(FRONTEND_URL, cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: [CUSTOM_HEADER_KEY],
      credentials: true
    }
  });

const gameNamespace = io.of("/game");
// setting ipProxy for games to push messages to clients on their own initiative
ioProxy.setIO(gameNamespace);

gameNamespace.on("connection", socket => {
    console.log('a user connected :)');
    // used to store informations about socket use
    const socketData = {
        socketGames: new Set(),
        socketPlayerId: null,
        socketPlayerName: null
    };

    // general game sockets

    // function called either when socket is disconnected or a leaveGame event is received
    function leaveGame(gameId, reason='leave'){
        if(!socketData.socketPlayerId){return;}
        // dereferencing player
        games.playerLeaveGame(socketData.socketPlayerId, gameId);
        socketData.socketGames.delete(gameId);
        // if game doesn't exist anymore eg last player left it nothing more is done
        if(!games.hasGame(gameId)){return;}
        // else emitting game leave chat message to other players
        const game = games.getGame(gameId);
        const messageData = game.addMessage(null, 'BOT', `${socketData.socketPlayerName} a quitté la partie${reason = 'disconnection' ? ' (déconnexion)' : ''}`);
        socket.to(gameId).emit('chatMessages', messageData);
    }  

    socket.on('disconnect', () => {
        console.log('a user disconnected :(');
        if(!!socketData.socketPlayerId){
            socketData.socketGames.forEach(gameId => {
                leaveGame(gameId, 'disconnection')});
        }
    });
    
    socket.on('leaveGame', (...args) => {
        if(!!socketData.socketPlayerId){
            leaveGame(args[0].gameId, 'leave')
        }
    });

    socket.on('createGame', (...args) => {
        console.log("will createGame with args:", args[0]);
        socketData.socketPlayerId = args[0].creatorId;
        socketData.socketPlayerName = args[0].creatorName;
        // referencing new game and player
        const game = games.addGame(socketData.socketPlayerId, socketData.socketPlayerName, args[0].parameters);
        socketData.socketGames.add(game.gameId);
        // notify successful game creation - sending game data
        socket.emit('gameCreated', game.getPublicData());
        // joining game room
        socket.join(game.gameId);
        // emitting game creation chat message
        const messageData = game.addMessage(null, 'BOT', `${game.creatorName} a créé la partie`);
        socket.emit('chatMessages', messageData);
    });

    socket.on('loadGame', (...args) => {
        const game = games.getGame(args[0].gameId);
        socketData.socketPlayerId = args[0].playerId;
        socketData.socketPlayerName = args[0].playerName;
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // referencing new player
        games.playerJoinGame(socketData.socketPlayerId, socketData.socketPlayerName, game.gameId);
        socketData.socketGames.add(game.gameId);
        // notify successful game loading - sending game data
        socket.emit('gameLoaded', {data: game.getPublicData()});
        // joining game room
        socket.join(game.gameId);
        // emitting game join chat message
        const messageData = game.addMessage(null, 'BOT', `${socketData.socketPlayerName} a rejoint la partie`);
        socket.to(game.gameId).emit('chatMessages', messageData);
        socket.emit('chatMessages', messageData);
    });

    socket.on('emitChatMessage', (...args) => {
        const gameId = args[0].gameId;
        if(!socketData.socketGames.has(gameId)){return;}
        const game = games.getGame(gameId);
        if(!game){return;}

        const messageData = game.addMessage(socketData.socketPlayerId, socketData.socketPlayerName, args[0].message);
        socket.to(game.gameId).emit('chatMessages', messageData);
        socket.emit('chatMessages', messageData);
    });

    // ongoing game sockets
    socket.on('startGame', (...args) => {
        const game = games.getGame(args[0].gameId);
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // only the creator can start the game
        if(game.creatorId !== socketData.socketPlayerId){return;}
        // game can be started only one
        if(game.isStarted()){return;}

        // then let's go !
        game.startGame();

        const gameData = {...game.getPublicData()};
        // we just don't send the chatMessages it's useless in this case
        gameData.chatMessages = null;

        // send chat start notification to all players
        const messageData = game.addMessage(null, 'BOT', `La partie va bientôt commencer !`);
        socket.to(game.gameId).emit('chatMessages', messageData);
        socket.emit('chatMessages', messageData);

        // send gameStarted notification and data to all players
        socket.to(game.gameId).emit('gameStarted', gameData);
        socket.emit('gameStarted', gameData);
    });
    socket.on('submitGuess', (...args) => {

        // "gameId":"g_268c9492-0141-4cbc-b9b7-21622780451c","guess":"dog"
        const game = games.getGame(args[0].gameId);
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // game has to be started
        if(!game.isStarted()){return;}
        // player has to be a valid playing player in this game
        if(!game.isPlayingPlayer(socketData.socketPlayerId)){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // ok then submit guess
        const result = game.playerSubmitGuess(socketData.socketPlayerId, args[0].guess);
        // ineffective action, stop here
        if(result === null){return;}
        // inform player of the result
        socket.emit('roundUpdate', {gameId: game.gameId,roundData: game.getPlayerData(socketData.socketPlayerId)});
        // if guess is correct, more actions are necessary
        if(result === true){
            // notify all players
            let messageData = game.addMessage(null, 'BOT', `${socketData.socketPlayerName} a trouvé la réponse !`);
            socket.to(game.gameId).emit('chatMessages', messageData);
            socket.emit('chatMessages', messageData);
            // check if round is over
            if(game.currentRoundIsOver()){
                game.closeCurrentRound();
                game.launchNextRound();
            }
            /*if(game.currentRoundIsOver()){
                messageData = game.addMessage(null, 'BOT', `Le tour ${game.currentRound.roundNumber} est terminé !`);
                socket.to(game.gameId).emit('chatMessages', messageData);
                socket.emit('chatMessages', messageData);
                // goto next round
                game.defineNextRound();
                const gameData = {...game.getPublicData()};
                // we just don't send the chatMessages it's useless in this case
                gameData.chatMessages = null;
                // send chat start notification to all players
                messageData = game.addMessage(null, 'BOT', `Le tour ${game.currentRound.roundNumber} / ${game.parameters.roundNumber} va bientôt commencer !`);
                socket.to(game.gameId).emit('chatMessages', messageData);
                socket.emit('chatMessages', messageData);

                // send gameUpdate notification and data to all players
                socket.to(game.gameId).emit('gameUpdate', gameData);
                socket.emit('gameUpdate', gameData);
            }*/
        }
    });
    socket.on('resetGame', (...args) => {
        const game = games.getGame(args[0].gameId);
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // only the creator can reset the game
        if(game.creatorId !== socketData.socketPlayerId){return;}
        // game can be reset only if started
        if(!game.isStarted()){return;}

        // then let's go !
        game.resetGame();
    });
  });

// the last declared road will handle all calls to serve the app
app.get('*', (req, res) => {
    res.sendFile(path.join(path.resolve(), './public/index.html'));
});  

server.listen(PORT, HOSTNAME, () => {
    console.log(`express server is running on port ${PORT}`);
});