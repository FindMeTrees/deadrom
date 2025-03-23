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

    if (!messageInput || !messageInput.value.trim()) {
        console.log("⚠️ Message input is empty.");
        return;
    }

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

    // ✅ Command to clear chat: "/clear"
    if (messageText === "/clear") {
        socket.emit("clearChat");
        messageInput.value = "";
        return;
    }

    // ✅ Send a regular chat message
    socket.emit("sendMessage", { username, message: messageText });
    messageInput.value = "";
}

// ✅ Listen for "Enter" key to send messages
document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ✅ Display all messages in chat (including "User Joined" and "User Left" messages)
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");

    if (!data || !data.username || !data.message) return;

    if (data.username === "System") {
        messageElement.style.fontStyle = "italic"; // Make system messages stand out
    }

    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// ✅ Notify users when someone is banned
socket.on("userBanned", (data) => {
    console.log(`User banned: IP=${data.ip}, Reason=${data.reason}`);
    alert(`A user was banned!\nIP: ${data.ip}\nReason: ${data.reason}`);
});

// ✅ Clear chat when "/clear" command is used
socket.on("clearChat", () => {
    document.getElementById("messageList").innerHTML = ""; // Clear chat UI
});
