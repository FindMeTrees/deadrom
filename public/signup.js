function signup() {
    const newUsername = document.getElementById('newUsername').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Check if passwords match
    if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    // Simulate user creation
    if (newUsername && newPassword) {
        alert("Sign up successful!");
        window.location.href = "login.html"; // Redirect to login
    } else {
        alert("Please fill in all fields.");
    }
}
