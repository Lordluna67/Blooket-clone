// auth.js - simple localStorage auth for prototype
const USERS_KEY = "blacket_users_v1";

function _getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || {};
  } catch (e) {
    return {};
  }
}
function _saveAllUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function signupLocal(email, password) {
  if (!email || !password) return { ok: false, message: "Provide email & password." };
  const users = _getAllUsers();
  if (users[email]) return { ok: false, message: "Account already exists." };
  if (password.length < 6) return { ok: false, message: "Password too short (min 6)." };

  users[email] = {
    password,
    tokens: 0,
    nextSpin: 0,
    inventory: [], // legacy array-based inventory (we convert to counts later)
    blooks: {}     // counts map id->count
  };
  _saveAllUsers(users);
  localStorage.setItem("currentUser", email);
  return { ok: true };
}

function loginLocal(email, password) {
  const users = _getAllUsers();
  if (!email || !password) return { ok: false, message: "Provide email & password." };
  const u = users[email];
  if (!u) return { ok: false, message: "Account not found." };
  if (u.password !== password) return { ok: false, message: "Incorrect password." };
  localStorage.setItem("currentUser", email);
  return { ok: true };
}

function logoutLocal() {
  localStorage.removeItem("currentUser");
}

// helpers for reading/writing current user's record
function _readUser() {
  const email = localStorage.getItem("currentUser");
  if (!email) return null;
  const users = _getAllUsers();
  if (!users[email]) return null;
  // migrate legacy inventory -> blooks counts if needed
  if (Array.isArray(users[email].inventory) && (!users[email].blooks || Object.keys(users[email].blooks).length === 0)) {
    const map = {};
    for (const id of users[email].inventory) map[id] = (map[id] || 0) + 1;
    users[email].blooks = map;
    users[email].inventory = [];
    _saveAllUsers(users);
  }
  return users[email];
}
function _writeUser(patch) {
  const email = localStorage.getItem("currentUser");
  if (!email) return false;
  const users = _getAllUsers();
  users[email] = { ...(users[email] || {}), ...patch };
  _saveAllUsers(users);
  return true;
}

// wire simple forms on login/signup pages
window.addEventListener("DOMContentLoaded", () => {
  // signup page UI
  const signupBtn = document.getElementById("signup-btn");
  if (signupBtn) {
    signupBtn.addEventListener("click", () => {
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value;
      const res = signupLocal(email, password);
      const msg = document.getElementById("signup-message");
      if (!res.ok) {
        msg.textContent = res.message; msg.style.color = "crimson";
        return;
      }
      // initialize user keys
      _writeUser({ tokens: 0, nextSpin: 0, blooks: {} });
      window.location.href = "stats.html";
    });
  }

  // login page UI
  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
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
  }

  // logout links (present in sidebars)
  document.querySelectorAll("#logout-link").forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      logoutLocal();
      window.location.href = "login.html";
    });
  });
});
