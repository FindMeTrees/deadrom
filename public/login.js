function login() {
    const username = document.getElementById('username').value.trim();

    if (username === "") {
        alert("Please enter a username.");
        return;
    }

    localStorage.setItem("username", username); // Save username in local storage
    window.location.href = "chatroom.html"; // Redirect to chatroom
}
