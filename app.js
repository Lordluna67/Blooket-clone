// app.js (updated) — includes Medieval Pack and reveal animation

// Simple guards: require currentUser
const currentUser = localStorage.getItem("currentUser");
if (!currentUser) {
  if (!location.href.endsWith("login.html") && !location.href.endsWith("signup.html") && !location.href.endsWith("index.html")) {
    window.location.href = "login.html";
  }
}

// Helpers to read/write users (same storage shape as auth.js)
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

// DOM ready
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".side-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) renderView(target);
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (typeof logoutLocal === "function") logoutLocal();
      localStorage.removeItem("currentUser");
      window.location.href = "login.html";
    });
  }

  renderView("stats");
  setupCanvas();
});

// ---------- simple user helpers ----------
function getTokens() {
  const u = _readUser();
  return u ? Number(u.tokens || 0) : 0;
}
function setTokens(v) { _writeUser({ tokens: Number(v) }); }
function getNextSpinTs() { const u = _readUser(); return u ? Number(u.nextSpin || 0) : 0; }
function setNextSpinTs(ts) { _writeUser({ nextSpin: Number(ts) }); }
function getInventory() { const u = _readUser(); return u ? (Array.isArray(u.inventory) ? u.inventory : []) : []; }
function addToInventory(itemId) { const inv = getInventory(); inv.push(itemId); _writeUser({ inventory: inv }); }

// ---------- pack definition (Medieval Pack) ----------
const MEDIEVAL_PACK = {
  id: "medieval_pack",
  name: "Medieval Pack",
  cost: 25,
  // Items with rarity and name, probabilities defined below
  items: [
    // Uncommons (5 × 13.5%)
    { id: "elf", name: "Elf", rarity: "uncommon", weight: 13.5 },
    { id: "witch", name: "Witch", rarity: "uncommon", weight: 13.5 },
    { id: "wizard", name: "Wizard", rarity: "uncommon", weight: 13.5 },
    { id: "fairy", name: "Fairy", rarity: "uncommon", weight: 13.5 },
    { id: "slime_monster", name: "Slime Monster", rarity: "uncommon", weight: 13.5 },
    // Rares (3 × 9%)
    { id: "jester", name: "Jester", rarity: "rare", weight: 9 },
    { id: "dragon", name: "Dragon", rarity: "rare", weight: 9 },
    { id: "queen", name: "Queen", rarity: "rare", weight: 9 },
    // Epic (1 × 5%)
    { id: "unicorn", name: "Unicorn", rarity: "epic", weight: 5 },
    // Legendary (1 × 1%)
    { id: "king", name: "King", rarity: "legendary", weight: 1 }
  ]
};

// Helper to pick one item from pack by weight (probabilities)
function pickFromPack(pack) {
  // build cumulative array
  const total = pack.items.reduce((s, it) => s + it.weight, 0);
  const r = Math.random() * total;
  let cum = 0;
  for (let it of pack.items) {
    cum += it.weight;
    if (r <= cum) return it;
  }
  // fallback
  return pack.items[pack.items.length - 1];
}

// ---------- Views & rendering ----------
function renderView(name) {
  const titleEl = document.getElementById("page-title");
  const content = document.getElementById("page-content");
  titleEl.textContent = name.charAt(0).toUpperCase() + name.slice(1);

  if (name === "stats") renderStats(content);
  else if (name === "market") renderMarket(content);
  else if (name === "bizzar") renderBizzar(content);
  else if (name === "blooks") renderBlooks(content);
}

// Stats view (unchanged)
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
    const now = Date.now();
    if (now >= getNextSpinTs()) {
      spinCountdown.textContent = "You can spin now!";
      spinBtn.disabled = false;
    } else {
      const rem = getNextSpinTs() - now;
      spinCountdown.textContent = `Next spin in ${formatHMS(rem)}`;
      spinBtn.disabled = true;
    }
  }

  tokensEl.textContent = getTokens();
  refreshCountdown();

  const interval = setInterval(() => {
    if (!document.getElementById("spin-countdown")) { clearInterval(interval); return; }
    refreshCountdown();
  }, 1000);

  spinBtn.addEventListener("click", () => {
    if (Date.now() < getNextSpinTs()) return;
    const reward = Math.floor(Math.random() * 501) + 500;
    setTokens(getTokens() + reward);
    setNextSpinTs(Date.now() + 12 * 60 * 60 * 1000);
    spinResult.textContent = `You won ${reward} tokens!`;
    tokensEl.textContent = getTokens();
    refreshCountdown();
  });
}

// Market view — includes Medieval Pack purchase
function renderMarket(container) {
  container.innerHTML = `
    <h3>Market</h3>
    <div id="market-list" class="market-grid"></div>
    <p id="market-msg" class="message"></p>
  `;

  const list = document.getElementById("market-list");
  const msg = document.getElementById("market-msg");
  list.innerHTML = "";

  // Show the Medieval Pack as a market card
  const packNode = document.createElement("div");
  packNode.className = "market-item pack-card";
  packNode.innerHTML = `
    <div class="pack-info">
      <strong>${MEDIEVAL_PACK.name}</strong>
      <div>Cost: ${MEDIEVAL_PACK.cost} tokens</div>
      <div class="pack-desc">Contains medieval-themed blooks. Try your luck!</div>
    </div>
    <div class="pack-actions">
      <button id="buy-medieval">Open Pack</button>
    </div>
  `;
  list.appendChild(packNode);

  document.getElementById("buy-medieval").addEventListener("click", () => {
    const tokens = getTokens();
    if (tokens < MEDIEVAL_PACK.cost) {
      msg.textContent = "Not enough tokens to buy the Medieval Pack.";
      msg.style.color = "crimson";
      return;
    }

    // Deduct cost
    setTokens(tokens - MEDIEVAL_PACK.cost);

    // pick a blook
    const picked = pickFromPack(MEDIEVAL_PACK);

    // add to inventory
    addToInventory(picked.id);

    // update any tokens display on page
    const tokensEl = document.getElementById("tokens-el");
    if (tokensEl) tokensEl.textContent = getTokens();

    msg.textContent = `You opened a ${MEDIEVAL_PACK.name}!`;
    msg.style.color = "white";

    // show reveal overlay with confetti and keep until user clicks
    showPackReveal(picked.name, picked.rarity);
  });

  // Optionally show other market items here
}

// Bizzar view placeholder
function renderBizzar(container) {
  container.innerHTML = `<h3>Bizzar (Coming Soon)</h3><p>Trading / special sales will appear here.</p>`;
}

// Blooks (inventory) view
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
    // try to determine name from pack definition (could expand to global catalog)
    const found = MEDIEVAL_PACK.items.find(x => x.id === id);
    const name = found ? found.name : id;
    const el = document.createElement("div");
    el.className = "inv-item";
    el.textContent = name;
    invList.appendChild(el);
  });
}

// ---------- Utility: format HH:MM:SS ----------
function formatHMS(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ---------- Pack Reveal UI + Confetti ----------
function showPackReveal(blookName, rarity) {
  // create overlay
  const overlay = document.createElement("div");
  overlay.className = "pack-overlay";
  overlay.innerHTML = `
    <div class="pack-card-reveal">
      <div class="pack-title">You got...</div>
      <div class="blook-name ${rarity}">${escapeHtml(blookName)}</div>
      <div class="pack-sub">Click anywhere to continue</div>
    </div>
  `;
  // confetti canvas
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  overlay.appendChild(canvas);

  document.body.appendChild(overlay);

  // start confetti
  const confettiController = startConfetti(canvas, rarity);

  // click to dismiss
  function removeOverlay() {
    confettiController.stop();
    overlay.classList.add("fade-out");
    setTimeout(() => {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 300);
    document.removeEventListener("click", onDocClick, true);
  }
  function onDocClick(e) {
    // only close when clicking overlay (not accidental clicks on buttons)
    if (overlay.contains(e.target)) {
      removeOverlay();
    }
  }
  // listen capture to ensure overlay click captured
  document.addEventListener("click", onDocClick, true);
}

// simple HTML escape
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

// ---------- Confetti engine (canvas) ----------
function startConfetti(canvas, rarity) {
  // map rarity to color(s)
  const colors = {
    uncommon: ["#2ecc71","#27ae60"],      // green
    rare: ["#3498db","#2e86de"],          // blue
    epic: ["#e74c3c","#c0392b"],          // red
    legendary: ["#f39c12","#f1c40f"]      // gold/orange
  };
  const palette = colors[rarity] || ["#ffffff"];

  // resize canvas
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const ctx = canvas.getContext("2d");
  let running = true;

  // particles
  const particles = [];
  const count = 120;

  for (let i = 0; i < count; i++) {
    particles.push(createParticle());
  }

  function createParticle() {
    const cx = Math.random() * canvas.width;
    const cy = Math.random() * (canvas.height * 0.5); // start upper half
    const vx = (Math.random() - 0.5) * 6;
    const vy = Math.random() * 6 + 2;
    const size = Math.random() * 8 + 4;
    const color = palette[Math.floor(Math.random() * palette.length)];
    const rot = Math.random() * Math.PI * 2;
    const spin = (Math.random() - 0.5) * 0.2;
    return { x: cx, y: cy, vx, vy, size, color, rot, spin, life: 300 + Math.random()*200 };
  }

  function update() {
    if (!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.12; // gravity
      p.rot += p.spin;
      p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
      ctx.restore();

      // recycle
      if (p.y > canvas.height + 50 || p.life <= 0) {
        const idx = particles.indexOf(p);
        particles[idx] = createParticle();
      }
    }
    rafId = requestAnimationFrame(update);
  }

  let rafId = requestAnimationFrame(update);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
      // clear canvas and remove resize listener
      ctx.clearRect(0,0,canvas.width,canvas.height);
      window.removeEventListener("resize", resize);
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
      // also remove overlay removal of canvas done by caller
    }
  };
}

// ---------- Canvas placeholder ----------
function setupCanvas() {
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width, h = canvas.height;
  ctx.fillStyle = "#111";
  ctx.fillRect(0,0,w,h);

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
