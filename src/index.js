import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { PORT, CUSTOM_HEADER_KEY, FRONTEND_URL } from './const.js';
import { games } from './game.js';




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
        // joining game room
        socket.join(game.gameId);
        socketGames.add(game.gameId);
        console.log(socket.rooms);
        // emitting game creation notification
        socket.emit('gameCreated', game.getPublicData());
    });
  });

server.listen(PORT, () => {
    console.log(`express server is running on port ${PORT}`);
});