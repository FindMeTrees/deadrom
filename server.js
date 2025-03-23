const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const useragent = require('useragent');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store chat messages and banned users (IP -> reason)
let messages = [];
let bannedUsers = {};

// Function to get real IP address
function getClientIp(socket) {
    let ip = socket.handshake.headers["x-forwarded-for"] || socket.request.connection.remoteAddress;
    if (ip.includes(",")) ip = ip.split(",")[0]; // Handle multiple forwarded IPs
    return ip.trim();
}

io.on('connection', (socket) => {
    const ip = getClientIp(socket);
    const agent = useragent.parse(socket.handshake.headers['user-agent']).toString();

    console.log(`User connected: IP=${ip}, Agent=${agent}`);

    // Check if the user is banned
    if (bannedUsers[ip]) {
        console.log(`Blocked connection from banned IP: ${ip}`);
        socket.emit("banned", bannedUsers[ip]); // Notify the user
        socket.disconnect(); // Force disconnect
        return;
    }

    // Send existing messages to new users
    socket.emit('loadMessages', messages);

    socket.on('sendMessage', (data) => {
        if (bannedUsers[ip]) return; // Prevent banned users from sending messages

        messages.push(data);
        io.emit('receiveMessage', data);
    });

    socket.on('clearChat', () => {
        console.log(`Chat cleared by user: ${ip}`);
        messages = [];
        io.emit("clearChat");
    });

    // Admin command to ban a user
    socket.on('banUser', (banData) => {
        if (!banData.adminKey || banData.adminKey !== "SECRET_ADMIN_KEY") return; // Protect admin actions
        if (!banData.ip) return;

        bannedUsers[banData.ip] = banData.reason || "No reason provided";
        console.log(`User banned: IP=${banData.ip}, Reason=${banData.reason}`);

        io.emit("userBanned", { ip: banData.ip, reason: banData.reason }); // Notify all users
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: IP=${ip}`);
    });
});

// Serve static frontend files from "public/" folder
app.use(express.static(path.join(__dirname, "public")));

// Redirect all unknown routes to login page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

