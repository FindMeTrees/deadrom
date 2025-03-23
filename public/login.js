function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hardcoded credentials for simulation
    const validUsername = 'user123';
    const validPassword = 'password123';

    // Check if the entered credentials match the valid ones
    if (username === validUsername && password === validPassword) {
        alert("Login successful!");
        localStorage.setItem("username", username); // Save the username in localStorage
        window.location.href = "chatroom.html"; // Redirect to the chatroom
    } else {
        alert("Invalid username or password.");
    }
}

// Continue as guest functionality
function continueAsGuest() {
    const guestUsername = "Guest" + Math.floor(Math.random() * 1000); // Generate random guest username
    alert("Continuing as Guest with username: " + guestUsername);
    localStorage.setItem("username", guestUsername); // Save guest username in localStorage
    window.location.href = "chatroom.html"; // Redirect to the chatroom
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Hardcoded credentials for simulation (you can replace with database logic)
    const validUsername = 'user123';
    const validPassword = 'password123';

    if (username === validUsername && password === validPassword) {
        localStorage.setItem("username", username); // Store username in local storage
        window.location.href = "chatroom.html"; // Redirect to chatroom
    } else {
        alert("Invalid username or password.");
    }
}

// Continue as guest functionality
function continueAsGuest() {
    const guestUsername = "Guest" + Math.floor(Math.random() * 1000);
    localStorage.setItem("username", guestUsername);
    window.location.href = "chatroom.html"; // Redirect to chatroom
}
