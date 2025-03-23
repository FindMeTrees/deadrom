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
        const messageText = messageInput.value.trim();

        // ✅ Admin command to ban a user: "/ban <IP> <Reason>"
        if (messageText.startsWith("/ban ")) {
            const parts = messageText.split(" ");
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
        if (messageText.startsWith("/unban ")) {
            const parts = messageText.split(" ");
            const ip = parts[1];

            socket.emit("unbanUser", {
                adminKey: "SECRET_ADMIN_KEY", // ⚠️ Change this to a secure key
                ip: ip
            });

            messageInput.value = "";
            return;
        }

        // ✅ Command to clear chat: "/clear"
        if (messageText === "/clear") {
            socket.emit("clearChat");
            messageInput.value = "";
            return;
        }

        // Send
