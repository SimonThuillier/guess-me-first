import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 3000;
const CUSTOM_HEADER_KEY = process.env.CUSTOM_HEADER_KEY || 'my-custom-header';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

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
    socket.on('disconnect', (socket) => {
        console.log('a user disconnected :(');
    });
    socket.onAny((eventName, ...args) => {
        console.log("received " + eventName + " event with args:", args);
    });
  });

server.listen(PORT, () => {
    console.log(`express server is running on port ${PORT}`);
});