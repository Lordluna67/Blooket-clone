for cleaner code. Here’s what should go in login.js:

login.js
// Get HTML elements
const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const message = document.getElementById("message");

// Login button click
loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            // Redirect to stats page after successful login
            window.location.href = "stats.html";
        })
        .catch((err) => {
            message.textContent = err.message;
        });
});

// Sign up button click
signupBtn.addEventListener("click", () => {
    window.location.href = "signup.html"; // redirect to signup page
});
