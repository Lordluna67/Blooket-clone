// app.js
// Single-file app controller (for stats.html)

// Simple guards
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  // If not on login/signup, send to login
  if (!location.href.endsWith("login.html") && !location.href.endsWith("signup.html") && !location.href.endsWith("index.html")) {
    window.location.href = "login.html";
  }
}

// Helper to read/write user record via auth.js functions
function _readUser() {
  const users = JSON.parse(localStorage.getItem("blacket_users_v1") || "{}");
  return users[localStorage.getItem("currentUser")] || null;
}
function _writeUser(newData) {
  const key = localStorage.getItem("currentUser");
  if (!key) return;
  const users = JSON.parse(localStorage.getItem("blacket_users_v1") || "{}");
  users[key] = { ...(users[key] || {}), ...newData };
  localStorage.setItem("blacket_users_v1", JSON.stringify(users));
}

// Ensure DOM ready
window.addEventListener("DOMContentLoaded", () => {
  // wire sidebar buttons
  document.querySelectorAll(".side-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) renderView(target);
      if (btn.id === "logout-btn") {
        // handled below
      }
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      // use auth.js's logoutLocal if available
      if (typeof logoutLocal === "function") logoutLocal();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  renderView("stats"); // default view
  setupCanvas();
});

// ---------- Utilities ----------
function getTokens() {
  const u = _readUser();
  if (!u) return 0;
  return Number(u.tokens || 0);
}
function setTokens(v) {
  _writeUser({ tokens: Number(v) });
}
function getNextSpinTs() {
  const u = _readUser();
  if (!u) return 0;
  return Number(u.nextSpin || 0);
}
function setNextSpinTs(ts) {
  _writeUser({ nextSpin: Number(ts) });
}
function getInventory() {
  const u = _readUser();
  if (!u) return [];
  return Array.isArray(u.inventory) ? u.inventory : [];
}
function addToInventory(itemId) {
  const inv = getInventory();
  inv.push(itemId);
  _writeUser({ inventory: inv });
}

// ---------- Countdown helper ----------
function formatHMS(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ---------- Spin logic ----------
function canSpinNow() {
  const now = Date.now();
  return now >= getNextSpinTs();
}

function performSpin(onUpdate) {
  if (!canSpinNow()) return false;
  const reward = Math.floor(Math.random() * 501) + 500; // 500-1000
  setTokens(getTokens() + reward);
  const next = Date.now() + 12 * 60 * 60 * 1000; // 12 hours
  setNextSpinTs(next);
  if (onUpdate) onUpdate(reward);
  return reward;
}

// ---------- Market catalog (example) ----------
const MARKET = [
  { id: "blook_apple", name: "Apple Blook", price: 200 },
  { id: "blook_star", name: "Star Blook", price: 500 },
  { id: "blook_legend", name: "Legendary Blook", price: 1200 }
];

// ---------- Render views ----------
function renderView(name) {
  const titleEl = document.getElementById("page-title");
  const content = document.getElementById("page-content");
  titleEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);

  if (name === "stats") {
    renderStats(content);
  } else if (name === "market") {
    renderMarket(content);
  } else if (name === "bizzar") {
    renderBizzar(content);
  } else if (name === "blooks") {
    renderBlooks(content);
  }
}

// Stats view
function renderStats(container) {
  const user = _readUser();
  if (!user) { container.innerHTML = "<p>User not found.</p>"; return; }

  container.innerHTML = `
    <p><strong>Email:</strong> ${localStorage.getItem("currentUser")}</p>
    <p><strong>Tokens:</strong> <span id="tokens-el">${getTokens()}</span></p>
    <h3>Daily Spin</h3>
    <button id="spin-btn">Spin Wheel</button>
    <p id="spin-result"></p>
    <p id="spin-countdown"></p>
  `;

  const spinBtn = document.getElementById("spin-btn");
  const spinResult = document.getElementById("spin-result");
  const spinCountdown = document.getElementById("spin-countdown");
  const tokensEl = document.getElementById("tokens-el");

  function refreshCountdown() {
    if (canSpinNow()) {
      spinCountdown.textContent = "You can spin now!";
      spinBtn.disabled = false;
    } else {
      const rem = getNextSpinTs() - Date.now();
      spinCountdown.textContent = `Next spin in ${formatHMS(rem)}`;
      spinBtn.disabled = true;
    }
  }

  // initial
  tokensEl.textContent = getTokens();
  refreshCountdown();

  const countdownTimer = setInterval(() => {
    const el = document.getElementById("spin-countdown");
    if (el) refreshCountdown(); else clearInterval(countdownTimer);
  }, 1000);

  spinBtn.addEventListener("click", () => {
    if (!canSpinNow()) return;
    const reward = performSpin(rew => {
      spinResult.textContent = `You won ${rew} tokens!`;
      tokensEl.textContent = getTokens();
    });
    refreshCountdown();
  });
}

// Market view
function renderMarket(container) {
  container.innerHTML = `<h3>Market</h3><div id="market-list"></div><p id="market-msg" class="message"></p>`;
  const list = document.getElementById("market-list");
  const msg = document.getElementById("market-msg");
  list.innerHTML = "";

  MARKET.forEach(item => {
    const node = document.createElement("div");
    node.className = "market-item";
    node.innerHTML = `
      <strong>${item.name}</strong>
      <div>Price: ${item.price} tokens</div>
      <button data-id="${item.id}">Buy</button>
    `;
    list.appendChild(node);
    const btn = node.querySelector("button");
    btn.addEventListener("click", () => {
      const tokens = getTokens();
      if (tokens < item.price) {
        msg.textContent = "Not enough tokens.";
        msg.style.color = "crimson";
        return;
      }
      setTokens(tokens - item.price);
      addToInventory(item.id);
      msg.textContent = `Bought ${item.name}!`;
      msg.style.color = "limegreen";
      // if on stats page, update token display element
      const tokensEl = document.getElementById("tokens-el");
      if (tokensEl) tokensEl.textContent = getTokens();
    });
  });
}

// Bizzar view (placeholder)
function renderBizzar(container) {
  container.innerHTML = `<h3>Bizzar (Coming Soon)</h3><p>Trading / special sales will appear here.</p>`;
}

// Blooks view (inventory)
function renderBlooks(container) {
  const inv = getInventory();
  if (!inv.length) {
    container.innerHTML = `<h3>Your Blooks</h3><p>You don't own any blooks yet.</p>`;
    return;
  }
  container.innerHTML = `<h3>Your Blooks</h3><div id="inv-list"></div>`;
  const invList = document.getElementById("inv-list");
  invList.innerHTML = "";
  inv.forEach(id => {
    const meta = MARKET.find(m => m.id === id);
    const name = meta ? meta.name : id;
    const el = document.createElement("div");
    el.className = "inv-item";
    el.textContent = name;
    invList.appendChild(el);
  });
}

// Canvas placeholder
function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,w,h);

  // simple animation
  let x = 50, y = 50, dx = 2, dy = 2, r = 18;
  function loop() {
    ctx.fillStyle = "#111";
    ctx.fillRect(0,0,w,h);
    ctx.beginPath();
    ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle = "#ffcc00";
    ctx.fill();
    ctx.closePath();
    x += dx; y += dy;
    if (x - r < 0 || x + r > w) dx = -dx;
    if (y - r < 0 || y + r > h) dy = -dy;
    requestAnimationFrame(loop);
  }
  loop();
}
