// auth.js - localStorage based authentication (simple, not secure; for dev only)

const USERS_KEY = "blacket_users_v1";
const CURRENT_KEY = "blacket_current_user";

function _getAllUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || {}; }
  catch (e) { return {}; }
}
function _saveAllUsers(obj) {
  localStorage.setItem(USERS_KEY, JSON.stringify(obj));
}

function signupLocal(email, password) {
  if (!email || !password) return { ok:false, message: "Email & password required." };
  const users = _getAllUsers();
  if (users[email]) return { ok:false, message: "Account exists." };
  if (password.length < 6) return { ok:false, message: "Password too short (min 6)." };

  users[email] = {
    pass: password,
    tokens: 0,
    nextSpin: 0,
    blooks: {} // mapping id -> count
  };
  _saveAllUsers(users);
  localStorage.setItem(CURRENT_KEY, email);
  return { ok:true };
}

function loginLocal(email, password) {
  if (!email || !password) return { ok:false, message: "Email & password required." };
  const users = _getAllUsers();
  const u = users[email];
  if (!u) return { ok:false, message: "Account not found." };
  if (u.pass !== password) return { ok:false, message: "Incorrect password." };
  localStorage.setItem(CURRENT_KEY, email);
  return { ok:true };
}

function logoutLocal() {
  localStorage.removeItem(CURRENT_KEY);
}

function getCurrentUserEmail() {
  return localStorage.getItem(CURRENT_KEY) || null;
}

function _readUserRecord() {
  const email = getCurrentUserEmail();
  if (!email) return null;
  const users = _getAllUsers();
  return users[email] || null;
}
function _writeUserRecord(patch) {
  const email = getCurrentUserEmail();
  if (!email) return false;
  const users = _getAllUsers();
  users[email] = { ...(users[email]||{}), ...patch };
  _saveAllUsers(users);
  return true;
}
