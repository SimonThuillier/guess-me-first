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
    const socketGames = new Set();
    let socketPlayerId = null;
    socket.on('disconnect', (socket) => {
        console.log('a user disconnected :(');
        if(!!socketPlayerId){
            socketGames.forEach(gameId => {games.playerLeaveGame(socketPlayerId, gameId)});
        }
    });
    socket.onAny((eventName, ...args) => {
        console.log("received " + eventName + " event with args:", args);
    });
    socket.on('createGame', (...args) => {
        console.log("will createGame with args:", args[0]);
        socketPlayerId = args[0].creatorId;
        const game = games.addGame(args[0].creatorId, args[0].creatorName, args[0].parameters);
        socketGames.add(game.gameId);
        // emitting game creation notification
        game.addMessage(null, 'BOT', `${game.creatorName} a créé la partie`);
        socket.emit('gameCreated', game.getPublicData());
        // joining game room
        socket.join(game.gameId);
    });
    socket.on('loadGame', (...args) => {
        console.log("will loadGame of args:", args[0]);
        const game = games.getGame(args[0].gameId);
        socketPlayerId = args[0].playerId;
        if(!game){
            socket.emit('gameLoaded', {error: "Game not found"});
            return;
        }
        games.playerJoinGame(socketPlayerId, game.gameId);
        game.addMessage(null, 'BOT', `${args[0].playerName} a rejoint la partie`);
        socket.emit('gameLoaded', {data: game.getPublicData()});
        // joining game room
        socket.join(game.gameId);
        console.log('emitting test chat');
        // console.log(gameNamespace.in('game.gamedId'));
        // const rooms = io.of("/game").adapter.rooms;
        socket.to(game.gameId).emit('chat-messages', 'test');
        // io.in('/game/test').emit('chat-messages', 'test');
    });
  });

server.listen(PORT, () => {
    console.log(`express server is running on port ${PORT}`);
});