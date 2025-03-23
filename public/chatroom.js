const socket = io("https://deadrom.onrender.com"); // Replace with your Render URL

// Redirect users to login page if they haven't entered a username
if (!localStorage.getItem("username")) {
    window.location.href = "login.html";
}

const username = localStorage.getItem("username");

// Function to send messages
function sendMessage() {
    const messageInput = document.getElementById("messageInput");

    if (messageInput.value.trim()) {
        // ✅ Admin command to ban a user: "/ban <IP> <Reason>"
        if (messageInput.value.startsWith("/ban ")) {
            const parts = messageInput.value.split(" ");
            const ip = parts[1];
            const reason = parts.slice(2).join(" ") || "No reason provided";

            socket.emit("banUser", {
                adminKey: "SECRET_ADMIN_KEY", // ⚠️ Change this to a secure key
                ip: ip,
                reason: reason
            });

            messageInput.value = "";
            return;
        }

        // Send a regular chat message
        socket.emit("sendMessage", { username, message: messageInput.value.trim() });
        messageInput.value = "";
    }
}

// Listen for new messages
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");
    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// Load past messages when connecting
socket.on("loadMessages", (messages) => {
    const messageList = document.getElementById("messageList");
    messageList.innerHTML = "";
    messages.forEach((data) => {
        const messageElement = document.createElement("li");
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageList.appendChild(messageElement);
    });
});

// ✅ Notify users when someone is banned
socket.on("userBanned", (data) => {
    console.log(`User banned: IP=${data.ip}, Reason=${data.reason}`);
    alert(`A user was banned!\nIP: ${data.ip}\nReason: ${data.reason}`);
});

// ✅ If a banned user connects, they are kicked
socket.on("banned", (reason) => {
    alert(`You have been banned!\nReason: ${reason}`);
    window.location.href = "https://google.com"; // Redirect banned users away
});

