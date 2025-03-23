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

// Store messages, banned users, and online users
let messages = [];
let bannedUsers = {};
let onlineUsers = {}; // Store connected users { socketID: username }

function getClientIp(socket) {
    let ip = socket.handshake.headers["x-forwarded-for"] || socket.request.connection.remoteAddress;
    if (ip.includes(",")) ip = ip.split(",")[0]; 
    return ip.trim();
}

io.on('connection', (socket) => {
    const ip = getClientIp(socket);
    console.log(`User connected: IP=${ip}`);

    if (bannedUsers[ip]) {
        console.log(`Blocked connection from banned IP: ${ip}`);
        socket.emit("banned", bannedUsers[ip]); 
        socket.disconnect();
        return;
    }

    socket.emit('loadMessages', messages);

    let userName = "";

    socket.on("setUsername", (username) => {
        userName = username;
        onlineUsers[socket.id] = username; // Add to online users
        console.log(`User joined: ${username}`);

        io.emit("updateUsers", Object.values(onlineUsers)); // Send updated user list

        const joinMessage = { username: "System", message: `${username} has joined the chat!` };
        messages.push(joinMessage);
        io.emit("receiveMessage", joinMessage);
    });

    socket.on('sendMessage', (data) => {
        if (bannedUsers[ip]) return;
        messages.push(data);
        io.emit('receiveMessage', data);
    });

    socket.on('clearChat', () => {
        console.log("Chat cleared.");
        messages = [];
        io.emit("clearChat");
    });

    socket.on('banUser', (banData) => {
        if (!banData.adminKey || banData.adminKey !== "SECRET_ADMIN_KEY") return;
        if (!banData.ip) return;

        bannedUsers[banData.ip] = banData.reason || "No reason provided";
        console.log(`User banned: IP=${banData.ip}, Reason=${banData.reason}`);
        io.emit("userBanned", { ip: banData.ip, reason: banData.reason });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userName || "Unknown User"}`);
        
        if (userName) {
            delete onlineUsers[socket.id]; // Remove from online users
            io.emit("updateUsers", Object.values(onlineUsers)); // Update online list
            
            const leaveMessage = { username: "System", message: `${userName} has left the chat!` };
            messages.push(leaveMessage);
            io.emit("receiveMessage", leaveMessage);
        }
    });
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
