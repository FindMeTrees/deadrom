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

    // ✅ Command to clear chat: "/clear"
    if (messageText === "/clear") {
        socket.emit("clearChat");
        messageInput.value = "";
        return;
    }

    // Send a regular chat message
    socket.emit("sendMessage", { username, message: messageText });
    messageInput.value = "";
}

// ✅ Listen for "Enter" key to send messages
document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ✅ Display all messages in chat
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");

    if (!data || !data.username || !data.message) return;

    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// ✅ Clear chat when "/clear" command is used
socket.on("clearChat", () => {
    document.getElementById("messageList").innerHTML = ""; // Clear chat UI
});
