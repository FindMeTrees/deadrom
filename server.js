const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let messages = []; // Store messages temporarily (use a database for persistence)

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send existing messages to new users
    socket.emit('loadMessages', messages);

    // Receive and broadcast new messages
    socket.on('sendMessage', (data) => {
        console.log("Message received:", data);
        messages.push(data);
        io.emit('receiveMessage', data);
    });

    // Handle /clear command
    socket.on('clearChat', () => {
        console.log("Chat cleared by user");
        messages = []; // Clear messages in memory
        io.emit("clearChat"); // Notify all clients to clear their messages
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

server.listen(3000, () => console.log('Server running on port 3000'));
