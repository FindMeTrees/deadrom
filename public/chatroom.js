const socket = io("https://deadrom.onrender.com"); 

if (!localStorage.getItem("username")) {
    window.location.href = "login.html";
}

const username = localStorage.getItem("username");

socket.emit("setUsername", username);

// Function to send messages
function sendMessage() {
    const messageInput = document.getElementById("messageInput");

    if (!messageInput || !messageInput.value.trim()) {
        console.log("⚠️ Message input is empty.");
        return;
    }

    const messageText = messageInput.value.trim();

    if (messageText.startsWith("/ban ")) {
        const parts = messageText.split(" ");
        const ip = parts[1];
        const reason = parts.slice(2).join(" ") || "No reason provided";

        socket.emit("banUser", {
            adminKey: "SECRET_ADMIN_KEY",
            ip: ip,
            reason: reason
        });

        messageInput.value = "";
        return;
    }

    if (messageText === "/clear") {
        socket.emit("clearChat");
        messageInput.value = "";
        return;
    }

    socket.emit("sendMessage", { username, message: messageText });
    messageInput.value = "";
}

document.getElementById("messageInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// ✅ Display messages
socket.on("receiveMessage", (data) => {
    const messageList = document.getElementById("messageList");
    const messageElement = document.createElement("li");

    if (!data || !data.username || !data.message) return;

    if (data.username === "System") {
        messageElement.style.fontStyle = "italic"; 
    }

    messageElement.textContent = `${data.username}: ${data.message}`;
    messageList.appendChild(messageElement);
    messageList.scrollTop = messageList.scrollHeight;
});

// ✅ Clear chat
socket.on("clearChat", () => {
    document.getElementById("messageList").innerHTML = "";
});

// ✅ Update "People Online" list
socket.on("updateUsers", (users) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; 

    users.forEach(user => {
        const userElement = document.createElement("li");
        userElement.textContent = user;
        userList.appendChild(userElement);
    });
});
