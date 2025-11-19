// signup.js (calls auth.js signupLocal)
document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signup-btn");
  if (!signupBtn) return;
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const res = signupLocal(email, password);
    const msg = document.getElementById("signup-message");
    if (!res.ok) {
      msg.textContent = res.message; msg.style.color = "crimson";
      return;
    }
    // initialize data keys
    _writeUser({ tokens: 0, nextSpin: 0, blooks: {} });
    window.location.href = "stats.html";
  });
});
