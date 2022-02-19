import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { PORT, CUSTOM_HEADER_KEY, FRONTEND_URL } from './const.js';
import { games, ioProxy } from './game.js';




// see https://socket.io/get-started/chat for basic configuration
// and https://socket.io/docs/v3/handling-cors/ for dealing with CORS (remember its purpose isn't to bother you but to make the web safer :))
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      allowedHeaders: [CUSTOM_HEADER_KEY],
      credentials: true
    }
  });

app.get('/', (req, res) => {
    res.send('Hello World!');
});

io.on('connection', (socket) => {
    /*console.log('a user connected :)');
    socket.on('disconnect', (socket) => {
        console.log('a user disconnected :(');
    });
    socket.onAny((eventName, ...args) => {
        console.log("received " + eventName + " event with args:", args);
    });*/
});

const gameNamespace = io.of("/game");
ioProxy.io = io;

gameNamespace.on("connection", socket => {
    console.log('a user connected :)');
    // used to store informations about socket use
    const socketData = {
        socketGames: new Set(),
        socketPlayerId: null,
        socketPlayerName: null
    };

    // function called either when socket is disconnected or a leaveGame event is received
    function leaveGame(gameId, reason='leave'){
        console.log("0",socketData.socketPlayerId);
        if(!socketData.socketPlayerId){return;}
        console.log("0");
        // dereferencing player
        games.playerLeaveGame(socketData.socketPlayerId, gameId);
        socketData.socketGames.delete(gameId);
        // if game doesn't exist anymore eg last player left it nothing more is done
        console.log(gameId);
        console.log("1", !games.hasGame(gameId));
        if(!games.hasGame(gameId)){return;}
        console.log("2");
        // else emitting game leave chat message to other players
        const game = games.getGame(gameId);
        const messageData = game.addMessage(null, 'BOT', `${socketData.socketPlayerName} a quitté la partie${reason = 'disconnection' ? ' (déconnexion)' : ''}`);
        socket.to(gameId).emit('chatMessages', messageData);
        console.log("3");
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
        console.log("will loadGame of args:", args[0]);
        const game = games.getGame(args[0].gameId);
        socketData.socketPlayerId = args[0].playerId;
        socketData.socketPlayerName = args[0].playerName;
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        // referencing new player
        games.playerJoinGame(socketData.socketPlayerId, game.gameId);
        socketData.socketGames.add(game.gameId);
        // notify successful game loading - sending game data
        socket.emit('gameLoaded', {data: game.getPublicData()});
        // joining game room
        socket.join(game.gameId);
        // emitting game join chat message
        const messageData = game.addMessage(null, 'BOT', `${socketData.socketPlayerName} a rejoint la partie`);
        socket.to(game.gameId).emit('chatMessages', messageData);
        socket.emit('chatMessages', messageData);

        // console.log(gameNamespace.in('game.gamedId'));
        // const rooms = io.of("/game").adapter.rooms;
        // socket.to(game.gameId).emit('chat-messages', 'test');
        // io.in('/game/test').emit('chat-messages', 'test');
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
  });

server.listen(PORT, () => {
    console.log(`express server is running on port ${PORT}`);
});