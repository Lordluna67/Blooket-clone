// login.js - page script for login.html
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("login-button") || document.getElementById("loginBtn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;
    const msg = document.getElementById("login-message");
    const res = loginLocal(email, pass);
    if (!res.ok) {
      if (msg) { msg.textContent = res.message; msg.style.color = "crimson"; }
      return;
    }
    // success
    window.location.href = "index.html";
  });
});
