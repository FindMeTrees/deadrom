const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store messages
let messages = [];

io.on('connection', (socket) => {
    console.log("A user connected.");

    // Send existing messages to new users
    socket.emit('loadMessages', messages);

    socket.on('sendMessage', (data) => {
        if (!data || !data.username || !data.message) return;

        messages.push(data);
        io.emit('receiveMessage', data);
    });

    // ✅ Allow only "/clear" command to remove messages
    socket.on('clearChat', () => {
        console.log("Chat cleared.");
        messages = [];
        io.emit("clearChat");
    });

    socket.on('disconnect', () => {
        console.log("A user disconnected.");
    });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Redirect all unknown routes to login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
