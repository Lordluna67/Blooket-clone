const loginBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.textContent = "Please enter both email and password.";
        return;
    }

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "stats.html";
        })
        .catch(err => {
            message.textContent = err.message;
        });
});

signupBtn.addEventListener("click", () => {
    window.location.href = "signup.html";
});
