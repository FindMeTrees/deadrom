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
        socket.emit("sendMessage", { username, message: messageInput.value.trim() });
        messageInput.value = "";
    }
}

// ✅ Display all messages in chat (including "User Joined" messages)
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");

    if (data.username === "System") {
        messageElement.style.fontStyle = "italic"; // Make "User Joined" messages stand out
    }

    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

