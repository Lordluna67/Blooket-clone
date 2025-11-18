// Get elements
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const message = document.getElementById("message");

// Login event
loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Logged in successfully
            message.textContent = "Login successful!";
            // Redirect to game page
            window.location.href = "index.html";
        })
        .catch((error) => {
            message.textContent = error.message;
        });
});

// Register event
registerBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.textContent = "Please enter email and password.";
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Registered successfully
            message.textContent = "Registration successful!";
            // Redirect to game page
            window.location.href = "index.html";
        })
        .catch((error) => {
            message.textContent = error.message;
        });
});
