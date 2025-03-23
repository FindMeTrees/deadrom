const socket = io("http://localhost:3000"); // Connect to backend

// Function to log out and redirect to login page
function logout() {
    localStorage.removeItem("username"); // Clear the username from localStorage
    alert("Logged out successfully!");
    window.location.href = "login.html"; // Redirect to login page
}

// Function to send a message (Make sure this is the ONLY `sendMessage()` function)
function sendMessage() {
    const messageInput = document.getElementById("messageInput");
    const username = localStorage.getItem("username") || "Guest";

    if (messageInput.value.trim()) {
        if (messageInput.value.trim().toLowerCase() === "/clear") {
            socket.emit("clearChat"); // Send clear command to the server
        } else {
            socket.emit("sendMessage", { username, message: messageInput.value.trim() });
        }
        messageInput.value = ""; // Clear input field
    }
}

// ✅ Fix: Remove duplicate event listener issues
document.getElementById("messageInput").removeEventListener("keypress", handleKeyPress);
document.getElementById("messageInput").addEventListener("keypress", handleKeyPress);

// Function to handle Enter key event
function handleKeyPress(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}

// Receive messages from the server
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");
    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// Load past messages on connection
socket.on("loadMessages", (messages) => {
    const messageList = document.getElementById("messageList");
    messageList.innerHTML = ""; // Clear existing messages
    messages.forEach((data) => {
        const messageElement = document.createElement("li");
        messageElement.textContent = `${data.username}: ${data.message}`;
        messageList.appendChild(messageElement);
    });
});

// Handle chat clear
socket.on("clearChat", () => {
    document.getElementById("messageList").innerHTML = ""; // Clear chat messages
});
