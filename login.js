const loginBtn = document.getElementById("login-btn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = "stats.html";
        })
        .catch(err => message.textContent = err.message);
});
