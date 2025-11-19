// login.js (only used if you included it separately)
document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("login-btn");
  if (!loginBtn) return;
  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const res = loginLocal(email, password);
    const msg = document.getElementById("login-message");
    if (!res.ok) {
      msg.textContent = res.message; msg.style.color = "crimson";
      return;
    }
    window.location.href = "stats.html";
  });
});
