const registerBtn = document.getElementById("register-btn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            localStorage.setItem(email + "_tokens", 0);
            localStorage.setItem(email + "_dailySpinData", JSON.stringify({ lastSpin: 0, available: true }));
            window.location.href = "stats.html";
        })
        .catch(err => message.textContent = err.message);
});
