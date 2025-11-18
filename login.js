import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDpYoktMVRAeNm6TU-y54Ckmdkmfei_iRA",
    authDomain: "blacket-game.firebaseapp.com",
    projectId: "blacket-game",
    storageBucket: "blacket-game.firebasestorage.app",
    messagingSenderId: "82935109494",
    appId: "1:82935109494:web:48d1cdf9cf89973ead8c57"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.getElementById("login-btn").addEventListener("click", () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            localStorage.setItem("currentUser", email);
            window.location.href = "stats.html";
        })
        .catch(err => document.getElementById("message").textContent = err.message);
});
