// auth.js
// Simple localStorage-based auth for prototype

// Utilities
function _usersKey() { return "blacket_users_v1"; } // users map
function _getUsers() {
  try {
    const raw = localStorage.getItem(_usersKey());
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}
function _saveUsers(u) { localStorage.setItem(_usersKey(), JSON.stringify(u)); }

// Exposed functions
function signupLocal(email, password) {
  const users = _getUsers();
  if (!email || !password) return { ok: false, message: "Provide email & password." };
  if (users[email]) return { ok: false, message: "Account already exists." };
  if (password.length < 6) return { ok: false, message: "Password too short (min 6)." };

  // create account
  users[email] = {
    password,
    tokens: 0,              // new accounts start with 0 tokens
    nextSpin: 0,            // timestamp for next allowed spin
    inventory: []           // array of blook IDs/names
  };
  _saveUsers(users);
  localStorage.setItem("currentUser", email);
  return { ok: true };
}

function loginLocal(email, password) {
  const users = _getUsers();
  if (!email || !password) return { ok: false, message: "Provide email & password." };
  const user = users[email];
  if (!user) return { ok: false, message: "Account not found." };
  if (user.password !== password) return { ok: false, message: "Incorrect password." };
  localStorage.setItem("currentUser", email);
  return { ok: true };
}

function logoutLocal() {
  localStorage.removeItem("currentUser");
}

function getCurrentLocalUserData() {
  const email = localStorage.getItem("currentUser");
  if (!email) return null;
  const users = _getUsers();
  return users[email] ? { email, ...users[email] } : null;
}

// helper to update stored users object
function updateCurrentUserData(patch) {
  const email = localStorage.getItem("currentUser");
  if (!email) return false;
  const users = _getUsers();
  if (!users[email]) return false;
  users[email] = { ...users[email], ...patch };
  _saveUsers(users);
  return true;
}

// wire signup/login UI if present
window.addEventListener("DOMContentLoaded", () => {
  // Signup page
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const result = signupLocal(email, password);
      const msgEl = document.getElementById("signup-message");
      if (!result.ok) {
        msgEl.textContent = result.message;
        msgEl.style.color = "crimson";
        return;
      }
      // initialize user data already done; redirect
      window.location.href = "stats.html";
    });
  }

  // Login page
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const result = loginLocal(email, password);
      const msgEl = document.getElementById("login-message");
      if (!result.ok) {
        msgEl.textContent = result.message;
        msgEl.style.color = "crimson";
        return;
      }
      window.location.href = "stats.html";
    });
  }
});
