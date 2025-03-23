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

// Store messages and banned users (IP -> reason)
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
    console.log(`User connected: IP=${ip}`);

    // Check if the user is banned
    if (bannedUsers[ip]) {
        console.log(`Blocked connection from banned IP: ${ip}`);
        socket.emit("banned", bannedUsers[ip]); // Notify the user
        socket.disconnect();
        return;
    }

    // Send existing messages to new users
    socket.emit('loadMessages', messages);

    let userName = ""; // Store username for disconnect event

    // Handle when a user sets their username
    socket.on("setUsername", (username) => {
        userName = username; // Store username
        console.log(`User joined: ${username}`);

        // Send a system message to all users
        const joinMessage = { username: "System", message: `${username} has joined the chat!` };
        messages.push(joinMessage);
        io.emit("receiveMessage", joinMessage);
    });

socket.on('sendMessage', (data) => {
    const ip = getClientIp(socket); // Ensure IP is being captured
    if (bannedUsers[ip]) return; // Prevent banned users from sending messages

    if (!data || !data.username || !data.message) {
        console.log("⚠️ Message missing data. Ignoring.");
        return;
    }

    console.log(`💬 ${data.username}: ${data.message}`); // Log messages for debugging
    messages.push(data);
    io.emit('receiveMessage', data); // Send message to all users
});


socket.on('clearChat', () => {
    const ip = getClientIp(socket); // Get user's real IP

    if (ip !== "212.58.121.65") { // Change this to your real IP
        console.log(`Unauthorized clear attempt from ${ip}`);
        socket.emit("receiveMessage", { username: "System", message: "❌ You are not allowed to clear the chat!" });
        return;
    }

    console.log(`✅ Chat cleared by admin: ${ip}`);
    messages = []; // Clear messages
    io.emit("clearChat"); // Notify all users
});


    // Admin command to ban a user
    socket.on('banUser', (banData) => {
        if (!banData.adminKey || banData.adminKey !== "SECRET_ADMIN_KEY") return; // Secure admin action
        if (!banData.ip) return;

        bannedUsers[banData.ip] = banData.reason || "No reason provided";
        console.log(`User banned: IP=${banData.ip}, Reason=${banData.reason}`);

        io.emit("userBanned", { ip: banData.ip, reason: banData.reason });
    });

    // Admin command to unban a user
    socket.on('unbanUser', (unbanData) => {
        if (!unbanData.adminKey || unbanData.adminKey !== "SECRET_ADMIN_KEY") return; // Protect admin actions
        if (!unbanData.ip) return;

        if (bannedUsers[unbanData.ip]) {
            delete bannedUsers[unbanData.ip]; // Remove user from banned list
            console.log(`User unbanned: IP=${unbanData.ip}`);
            io.emit("userUnbanned", { ip: unbanData.ip });
        }
    });

    // Handle when a user disconnects
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userName || "Unknown User"}`);

        if (userName) {
            // Send "User Left" message to chat
            const leaveMessage = { username: "System", message: `${userName} has left the chat!` };
            messages.push(leaveMessage);
            io.emit("receiveMessage", leaveMessage);
        }
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
