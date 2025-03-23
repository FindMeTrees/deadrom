const socket = io("https://deadrom.onrender.com"); // Replace with your Render URL

// Redirect users to login page if they haven't entered a username
if (!localStorage.getItem("username")) {
    window.location.href = "login.html";
}

const username = localStorage.getItem("username");

// ✅ Send username to server when user connects
socket.emit("setUsername", username);

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

        // ✅ Admin command to unban a user: "/unban <IP>"
        if (messageInput.value.startsWith("/unban ")) {
            const parts = messageInput.value.split(" ");
            const ip = parts[1];

            socket.emit("unbanUser", {
                adminKey: "SECRET_ADMIN_KEY", // ⚠️ Change this to a secure key
                ip: ip
            });

            messageInput.value = "";
            return;
        }

        // Send a regular chat message
        socket.emit("sendMessage", { username, message: messageInput.value.trim() });
        messageInput.value = "";
    }
}

// ✅ Display all messages in chat (including "User Joined" and "User Left" messages)
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");

    if (data.username === "System") {
        messageElement.style.fontStyle = "italic"; // Make system messages stand out
    }

    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// ✅ Notify users when someone is unbanned
socket.on("userUnbanned", (data) => {
    console.log(`User unbanned: IP=${data.ip}`);
    alert(`A user was unbanned!\nIP: ${data.ip}`);
});
