const registerBtn = document.getElementById("register-btn");
const message = document.getElementById("message");

registerBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if(!email || !password){
        message.textContent = "Please enter both email and password.";
        return;
    }

    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => {
            // initialize user stats
            localStorage.setItem(email + "_tokens", 500);
            localStorage.setItem(email + "_dailySpin", "true");

            // redirect to stats page
            window.location.href = "stats.html";
        })
        .catch(err => {
            message.textContent = err.message;
        });
});
