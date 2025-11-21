// signup.js - page script for signup.html
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("signup-button");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value.trim();
    const pass = document.getElementById("signup-pass").value;
    const msg = document.getElementById("signup-message");
    const res = signupLocal(email, pass);
    if (!res.ok) {
      if (msg) { msg.textContent = res.message; msg.style.color = "crimson"; }
      else alert(res.message);
      return;
    }
    // success: go to index
    window.location.href = "index.html";
  });
});
