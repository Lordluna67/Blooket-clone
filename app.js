// app.js - main game logic (localStorage-based)

// BLOOK IMAGE URLs (you provided)
const BLOOK_IMAGES = {
  elf: "https://ac.blooket.com/marketassets/blooks/elf.svg",
  witch: "https://ac.blooket.com/marketassets/blooks/witch.svg",
  wizard: "https://ac.blooket.com/marketassets/blooks/wizard.svg",
  fairy: "https://ac.blooket.com/marketassets/blooks/fairy.svg",
  slimemonster: "https://ac.blooket.com/marketassets/blooks/slimemonster.svg",
  jester: "https://ac.blooket.com/marketassets/blooks/jester.svg",
  dragon: "https://ac.blooket.com/marketassets/blooks/dragon.svg",
  queen: "https://ac.blooket.com/marketassets/blooks/queen.svg",
  unicorn: "https://ac.blooket.com/marketassets/blooks/unicorn.svg",
  king: "https://ac.blooket.com/marketassets/blooks/king.svg"
};

// Catalog with rarities and weights (matches your spec)
const CATALOG = [
  { id: "elf", name: "Elf", rarity: "uncommon", weight: 13.5 },
  { id: "witch", name: "Witch", rarity: "uncommon", weight: 13.5 },
  { id: "wizard", name: "Wizard", rarity: "uncommon", weight: 13.5 },
  { id: "fairy", name: "Fairy", rarity: "uncommon", weight: 13.5 },
  { id: "slimemonster", name: "Slime Monster", rarity: "uncommon", weight: 13.5 },

  { id: "jester", name: "Jester", rarity: "rare", weight: 9 },
  { id: "dragon", name: "Dragon", rarity: "rare", weight: 9 },
  { id: "queen", name: "Queen", rarity: "rare", weight: 9 },

  { id: "unicorn", name: "Unicorn", rarity: "epic", weight: 5 },
  { id: "king", name: "King", rarity: "legendary", weight: 1 }
];

// Sell prices
const SELL_PRICE = { uncommon: 5, rare: 20, epic: 75, legendary: 200 };

// Pack (Medieval)
const MEDIEVAL_PACK = {
  id: "medieval",
  name: "Medieval Pack",
  cost: 25,
  items: CATALOG.map(c => ({ id: c.id, weight: c.weight }))
};

// Helpers for current user access using auth.js functions
function getCurrentEmail() { return getCurrentUserEmail(); }
function getUserRecord() { return _readUserRecord(); }
function writeUserRecord(patch) { return _writeUserRecord(patch); }

// user-level convenience functions
function getTokens() {
  const u = getUserRecord(); return u ? Number(u.tokens || 0) : 0;
}
function setTokens(v) { writeUserRecord({ tokens: Number(v) }); }
function getNextSpin() { const u = getUserRecord(); return u ? Number(u.nextSpin || 0) : 0; }
function setNextSpin(ts) { writeUserRecord({ nextSpin: Number(ts) }); }
function getBlooks() { const u = getUserRecord(); return (u && u.blooks) ? u.blooks : {}; }
function setBlooks(b) { writeUserRecord({ blooks: b }); }
function addBlook(id, count = 1) {
  const b = getBlooks();
  b[id] = (b[id] || 0) + Number(count);
  setBlooks(b);
}
function removeBlook(id, count = 1) {
  const b = getBlooks();
  if (!b[id]) return;
  b[id] = b[id] - Number(count);
  if (b[id] <= 0) delete b[id];
  setBlooks(b);
}

// pick by weight
function pickFromPack(pack) {
  const pool = pack.items;
  const total = pool.reduce((s, it) => s + it.weight, 0);
  let r = Math.random() * total;
  for (const it of pool) {
    if (r <= it.weight) return CATALOG.find(c => c.id === it.id);
    r -= it.weight;
  }
  return CATALOG[CATALOG.length - 1];
}

// confetti canvas used by reveal overlay (stays until click)
function startConfetti(canvas, rarity) {
  const palettes = {
    uncommon: ["#2ecc71","#27ae60"],
    rare: ["#3498db","#2e86de"],
    epic: ["#e74c3c","#c0392b"],
    legendary: ["#f39c12","#f1c40f"]
  };
  const colors = palettes[rarity] || ["#fff"];
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener("resize", resize);
  const ctx = canvas.getContext("2d");
  const particles = [];
  let running = true;
  for (let i=0;i<120;i++) particles.push(create());
  function create(){
    return {
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height*0.3,
      vx: (Math.random()-0.5)*6,
      vy: Math.random()*6+2,
      size: Math.random()*8+4,
      color: colors[Math.floor(Math.random()*colors.length)],
      rot: Math.random()*Math.PI*2,
      spin: (Math.random()-0.5)*0.2,
      life: 300+Math.random()*200
    };
  }
  let raf;
  function update(){
    if(!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.rot += p.spin; p.life--;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle = p.color; ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
      ctx.restore();
      if (p.y > canvas.height + 50 || p.life <= 0) {
        const i = particles.indexOf(p);
        particles[i] = create();
      }
    }
    raf = requestAnimationFrame(update);
  }
  update();
  return {
    stop() {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0,0,canvas.width,canvas.height);
      window.removeEventListener("resize", resize);
    }
  };
}

// reveal overlay stays until user clicks anywhere on overlay
function showReveal(blook) {
  const overlay = document.createElement("div");
  overlay.className = "pack-overlay";
  overlay.innerHTML = `
    <div class="pack-card-reveal">
      <div class="pack-title">You got...</div>
      <img src="${BLOOK_IMAGES[blook.id]}" class="reveal-img" alt="${blook.name}">
      <div class="blook-name ${blook.rarity}">${blook.name}</div>
      <div class="pack-sub">Click anywhere to continue</div>
    </div>
  `;
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  overlay.appendChild(canvas);
  document.body.appendChild(overlay);
  const conf = startConfetti(canvas, blook.rarity);
  function remove() {
    conf.stop();
    overlay.classList.add("fade-out");
    setTimeout(()=> overlay.remove(), 250);
    document.removeEventListener("click", onClick, true);
  }
  function onClick(e) {
    if (overlay.contains(e.target)) remove();
  }
  document.addEventListener("click", onClick, true);
}

// UI renderers
function renderStatsPage() {
  const page = document.getElementById("page-content");
  if (!page) return;
  const u = getUserRecord();
  if (!u) { page.innerHTML = "<p>User not found. Please log in.</p>"; return; }
  page.innerHTML = `
    <div class="panel">
      <h2>Stats</h2>
      <p><strong>Email:</strong> ${getCurrentEmail()}</p>
      <p><strong>Tokens:</strong> <span id="tokens-count">${getTokens()}</span></p>
      <h3>Daily Spin</h3>
      <p>Available: <span id="spin-available"></span></p>
      <p id="spin-countdown"></p>
      <button id="spin-button">Spin Daily Wheel</button>
    </div>
  `;
  updateSpinDisplay();
  document.getElementById("spin-button").onclick = () => {
    if (!isSpinAvailable()) { alert("Spin not ready yet."); return; }
    const reward = Math.floor(Math.random()*501)+500;
    setTokens(getTokens() + reward);
    setNextSpinTs(Date.now() + 12*60*60*1000);
    document.getElementById("tokens-count").textContent = getTokens();
    alert(`You won ${reward} tokens!`);
    updateSpinDisplay();
  };
}

function updateSpinDisplay() {
  const avail = isSpinAvailable();
  document.getElementById("spin-available").textContent = avail ? "Yes" : "No";
  const countdown = document.getElementById("spin-countdown");
  if (!countdown) return;
  if (avail) countdown.textContent = "(ready)";
  else {
    const rem = getNextSpin() - Date.now();
    countdown.textContent = `Next spin in ${formatHMS(Math.max(0,rem))}`;
    // update every second
    setTimeout(updateSpinDisplay, 1000);
  }
}

function isSpinAvailable() {
  const now = Date.now();
  const next = getNextSpin() || 0;
  return now >= next;
}
function getNextSpinTs() { return getNextSpin(); }
function setNextSpinTs(ts) { setNextSpin(ts); }

// Market
function renderMarketPage() {
  const page = document.getElementById("page-content");
  if (!page) return;
  page.innerHTML = `
    <div class="panel">
      <h2>Market</h2>
      <div class="market-grid">
        <div class="pack-card">
          <div class="pack-preview" style="background-image:url('/mnt/data/5f607bd7-a94c-4bcd-877a-60fc9b17b7c6.png')"></div>
          <div class="pack-info">
            <strong>${MEDIEVAL_PACK.name}</strong>
            <p>Cost: ${MEDIEVAL_PACK.cost} tokens</p>
            <button id="open-pack-btn">Open Pack</button>
            <div id="pack-result-container"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.getElementById("open-pack-btn").onclick = () => {
    if (getTokens() < MEDIEVAL_PACK.cost) {
      const msg = document.getElementById("pack-result-container");
      msg.textContent = "Not enough tokens.";
      msg.style.color = "crimson";
      return;
    }
    setTokens(getTokens() - MEDIEVAL_PACK.cost);
    const picked = pickFromPack(MEDIEVAL_PACK);
    addBlook(picked.id, 1);
    showReveal(picked);
    // update any token displays
    const tokensSpan = document.getElementById("tokens-count");
    if (tokensSpan) tokensSpan.textContent = getTokens();
  };
}

// Blooks page
function renderBlooksPage() {
  const page = document.getElementById("page-content");
  if (!page) return;
  const b = getBlooks();
  let html = `<div class="panel"><h2>Your Blooks</h2><div class="blooks-grid">`;
  for (const item of CATALOG) {
    const cnt = Number(b[item.id] || 0);
    html += `
      <div class="blook-tile">
        <div class="blook-circle ${item.rarity}">
          <img src="${BLOOK_IMAGES[item.id]}" alt="${item.name}" class="blook-img">
        </div>
        <div class="blook-meta">
          <div class="blook-name">${item.name}</div>
          <div class="blook-count">x<span class="count-val" data-id="${item.id}">${cnt}</span></div>
          <div class="blook-actions">
            <button class="sell-one" data-id="${item.id}">Sell 1 (${SELL_PRICE[item.rarity]})</button>
            ${cnt > 1 ? `<button class="sell-dups" data-id="${item.id}">Sell All Except 1</button>` : `<button class="sell-dups hidden" data-id="${item.id}">Sell All Except 1</button>`}
          </div>
        </div>
      </div>
    `;
  }
  html += `</div><p class="coming-soon">More packs coming soon!</p></div>`;
  page.innerHTML = html;

  // wire sell buttons
  page.querySelectorAll(".sell-one").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const before = getBlooks()[id] || 0;
      if (before <= 0) return;
      removeBlook(id, 1);
      const rarity = CATALOG.find(c => c.id === id).rarity;
      setTokens(getTokens() + SELL_PRICE[rarity]);
      const el = page.querySelector(`.count-val[data-id="${id}"]`);
      if (el) el.textContent = Number(getBlooks()[id] || 0);
      updateTokensUI();
      refreshDupBtn(page, id);
    });
  });

  page.querySelectorAll(".sell-dups").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const have = Number(getBlooks()[id] || 0);
      if (have <= 1) return;
      const sellCount = have - 1;
      const rarity = CATALOG.find(c => c.id === id).rarity;
      const gain = sellCount * SELL_PRICE[rarity];
      const current = getBlooks();
      current[id] = 1;
      setBlooks(current);
      setTokens(getTokens() + gain);
      const el = page.querySelector(`.count-val[data-id="${id}"]`);
      if (el) el.textContent = 1;
      updateTokensUI();
      refreshDupBtn(page, id);
    });
  });
}

function refreshDupBtn(page, id) {
  const count = Number(getBlooks()[id] || 0);
  const btn = page.querySelector(`.sell-dups[data-id="${id}"]`);
  if (!btn) return;
  if (count > 1) btn.classList.remove("hidden");
  else btn.classList.add("hidden");
}

function updateTokensUI() {
  const tokensSpan = document.getElementById("tokens-count");
  if (tokensSpan) tokensSpan.textContent = getTokens();
  const headerInfo = document.getElementById("user-info");
  if (headerInfo) headerInfo.textContent = `${getCurrentEmail()} — ${getTokens()} tokens`;
}

// utility format
function formatHMS(ms) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// page navigation + init
document.addEventListener("DOMContentLoaded", () => {
  // redirect to login if not logged in
  if (!getCurrentEmail()) {
    window.location.href = "login.html";
    return;
  }

  // wire sidebar and logout
  document.querySelectorAll(".nav-btn").forEach(b => {
    b.addEventListener("click", () => {
      const t = b.dataset.target;
      document.getElementById("page-title").textContent = t.charAt(0).toUpperCase() + t.slice(1);
      if (t === "stats") renderStatsPage();
      if (t === "market") renderMarketPage();
      if (t === "blooks") renderBlooksPage();
      if (t === "bizzar") {
        document.getElementById("page-content").innerHTML = "<div class='panel'><h2>Bizzar</h2><p>Coming soon!</p></div>";
      }
    });
  });

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) logoutBtn.addEventListener("click", () => { logoutLocal(); window.location.href = "login.html"; });

  // show user and default page
  updateTokensUI();
  document.getElementById("page-title").textContent = "Stats";
  renderStatsPage();
});
