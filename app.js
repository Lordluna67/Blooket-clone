// app.js - shared logic for multi-page app

// Blook public image URLs
const BLOOK_IMAGES = {
  king: "https://ac.blooket.com/marketassets/blooks/king.svg",
  unicorn: "https://ac.blooket.com/marketassets/blooks/unicorn.svg",
  queen: "https://ac.blooket.com/marketassets/blooks/queen.svg",
  dragon: "https://ac.blooket.com/marketassets/blooks/dragon.svg",
  jester: "https://ac.blooket.com/marketassets/blooks/jester.svg",
  slimemonster: "https://ac.blooket.com/marketassets/blooks/slimemonster.svg",
  fairy: "https://ac.blooket.com/marketassets/blooks/fairy.svg",
  elf: "https://ac.blooket.com/marketassets/blooks/elf.svg",
  wizard: "https://ac.blooket.com/marketassets/blooks/wizard.svg",
  witch: "https://ac.blooket.com/marketassets/blooks/witch.svg"
};

// Blook catalog (same order as screenshot)
const BLOOK_CATALOG = [
  { id: "elf", name: "Elf", rarity: "uncommon" },
  { id: "witch", name: "Witch", rarity: "uncommon" },
  { id: "wizard", name: "Wizard", rarity: "uncommon" },
  { id: "fairy", name: "Fairy", rarity: "uncommon" },
  { id: "slime_monster", name: "Slime Monster", rarity: "uncommon" },

  { id: "jester", name: "Jester", rarity: "rare" },
  { id: "dragon", name: "Dragon", rarity: "rare" },
  { id: "queen", name: "Queen", rarity: "rare" },

  { id: "unicorn", name: "Unicorn", rarity: "epic" },
  { id: "king", name: "King", rarity: "legendary" }
];

// SELL PRICES
const SELL_PRICES = { uncommon: 5, rare: 20, epic: 75, legendary: 200 };

// MEDIEVAL PACK definition and weights
const MEDIEVAL_PACK = {
  cost: 25,
  items: [
    { id: "elf", weight: 13.5 },
    { id: "witch", weight: 13.5 },
    { id: "wizard", weight: 13.5 },
    { id: "fairy", weight: 13.5 },
    { id: "slime_monster", weight: 13.5 },
    { id: "jester", weight: 9 },
    { id: "dragon", weight: 9 },
    { id: "queen", weight: 9 },
    { id: "unicorn", weight: 5 },
    { id: "king", weight: 1 }
  ]
};

// helpers to read/write current user record via auth.js internals
function _readUserRecord() { return _readUser(); } // uses auth.js _readUser
function _writeUserRecord(patch) { return _writeUser(patch); } // uses auth.js _writeUser

function getTokens() {
  const u = _readUserRecord(); return u ? Number(u.tokens || 0) : 0;
}
function setTokens(v) { _writeUserRecord({ tokens: Number(v) }); }

// Blooks object stored inside user record as 'blooks' (id->count)
function getBlooks() {
  const u = _readUserRecord(); return (u && u.blooks) ? u.blooks : {};
}
function setBlooks(obj) { _writeUserRecord({ blooks: obj }); }
function addBlook(id, count = 1) {
  const obj = getBlooks();
  obj[id] = (obj[id] || 0) + Number(count);
  setBlooks(obj);
}
function removeBlook(id, count = 1) {
  const obj = getBlooks();
  if (!obj[id]) return;
  obj[id] = obj[id] - Number(count);
  if (obj[id] <= 0) delete obj[id];
  setBlooks(obj);
}

// pick from pack by weight
function pickFromPack(pack) {
  const total = pack.items.reduce((s, it) => s + it.weight, 0);
  const r = Math.random() * total;
  let cum = 0;
  for (const it of pack.items) {
    cum += it.weight;
    if (r <= cum) {
      return BLOOK_CATALOG.find(b => b.id === it.id);
    }
  }
  return BLOOK_CATALOG.find(b => b.id === pack.items[pack.items.length-1].id);
}

// show reveal overlay (stays until click)
function showPackReveal(blook) {
  const overlay = document.createElement("div");
  overlay.className = "pack-overlay";

  const card = document.createElement("div");
  card.className = "pack-card-reveal";
  card.innerHTML = `
    <div class="pack-title">You got...</div>
    <img src="${BLOOK_IMAGES[blook.id]}" class="reveal-img" alt="${blook.name}" />
    <div class="blook-name ${blook.rarity}">${escapeHtml(blook.name)}</div>
    <div class="pack-sub">Click anywhere to continue</div>
  `;

  // confetti canvas
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  overlay.appendChild(canvas);
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  const controller = startConfetti(canvas, blook.rarity);

  function remove() {
    controller.stop();
    overlay.classList.add("fade-out");
    setTimeout(()=> overlay.remove(), 300);
    document.removeEventListener("click", onClick, true);
  }
  function onClick(e) { if (overlay.contains(e.target)) remove(); }
  document.addEventListener("click", onClick, true);
}

// confetti engine (same as earlier)
function startConfetti(canvas, rarity) {
  const colors = {
    uncommon: ["#2ecc71","#27ae60"],
    rare: ["#3498db","#2e86de"],
    epic: ["#e74c3c","#c0392b"],
    legendary: ["#f39c12","#f1c40f"]
  };
  const palette = colors[rarity] || ["#fff"];
  function resize(){ canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  resize(); window.addEventListener("resize", resize);
  const ctx = canvas.getContext("2d");
  let running = true;
  const particles = [];
  for (let i=0;i<120;i++) {
    particles.push(create());
  }
  function create(){
    return {
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height*0.4,
      vx: (Math.random()-0.5)*6,
      vy: Math.random()*6+2,
      size: Math.random()*8+4,
      color: palette[Math.floor(Math.random()*palette.length)],
      rot: Math.random()*Math.PI*2,
      spin: (Math.random()-0.5)*0.2,
      life: 300+Math.random()*200
    };
  }
  function update(){
    if(!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let p of particles){
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.12; p.rot+=p.spin; p.life--;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot);
      ctx.fillStyle=p.color; ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size*0.6);
      ctx.restore();
      if (p.y>canvas.height+50||p.life<=0) particles[particles.indexOf(p)]=create();
    }
    raf = requestAnimationFrame(update);
  }
  let raf = requestAnimationFrame(update);
  return { stop(){ running=false; cancelAnimationFrame(raf); ctx.clearRect(0,0,canvas.width,canvas.height); window.removeEventListener("resize", resize); if (canvas.parentNode) canvas.parentNode.removeChild(canvas); } };
}

// small utility
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])); }

// ---------- Page renderers (multi-page) ----------
function renderStatsPage() {
  const content = document.getElementById("page-content");
  if (!content) return;
  const user = _readUserRecord();
  if (!user) { content.innerHTML = "<p>User not found.</p>"; return; }
  content.innerHTML = `
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
  function refresh(){
    const now = Date.now();
    const next = user.nextSpin || 0;
    if (now >= next){ spinCountdown.textContent="You can spin now!"; spinBtn.disabled=false; }
    else { spinCountdown.textContent = `Next spin in ${formatHMS(next-Date.now())}`; spinBtn.disabled=true; }
    document.getElementById("tokens-el").textContent = getTokens();
  }
  refresh();
  const interval = setInterval(()=>{ if (!document.getElementById("spin-countdown")) clearInterval(interval); else refresh(); },1000);
  spinBtn.addEventListener("click", () => {
    const now = Date.now();
    const next = (user.nextSpin || 0);
    if (now < next) return;
    const reward = Math.floor(Math.random()*501)+500;
    setTokens(getTokens()+reward);
    _writeUserRecord({ nextSpin: Date.now() + 12*60*60*1000 });
    spinResult.textContent = `You won ${reward} tokens!`;
    refresh();
  });
}

function renderMarketPage() {
  const content = document.getElementById("page-content");
  if (!content) return;
  content.innerHTML = `
    <div class="market-grid">
      <div class="market-pack-card">
        <div class="pack-art" style="background-image:url('/mnt/data/5f607bd7-a94c-4bcd-877a-60fc9b17b7c6.png')"></div>
        <div class="pack-info">
          <h3>Medieval Pack</h3>
          <p>Cost: ${MEDIEVAL_PACK.cost} tokens</p>
          <button id="open-medieval">Open Pack</button>
        </div>
      </div>
    </div>
    <p id="market-msg" class="message"></p>
  `;
  document.getElementById("open-medieval").addEventListener("click", () => {
    const tokens = getTokens();
    const msg = document.getElementById("market-msg");
    if (tokens < MEDIEVAL_PACK.cost) { msg.textContent="Not enough tokens."; msg.style.color="crimson"; return; }
    setTokens(tokens - MEDIEVAL_PACK.cost);
    const picked = pickFromPack(MEDIEVAL_PACK);
    addBlook(picked.id,1);
    showPackReveal(picked);
    msg.textContent = `You opened a ${picked.name}!`; msg.style.color="white";
  });
}

function renderBlooksPage() {
  const content = document.getElementById("page-content");
  if (!content) return;
  const blooks = getBlooks();
  let html = `<div class="blooks-page"><div class="pack-container"><h2 class="pack-title">Medieval Pack</h2><div class="blook-grid">`;
  for (const b of BLOOK_CATALOG) {
    const count = Number(blooks[b.id] || 0);
    html += `
      <div class="blook-tile">
        <div class="blook-circle ${b.rarity}"><img src="${BLOOK_IMAGES[b.id]}" class="blook-img" alt="${b.name}"></div>
        <div class="blook-meta">
          <div class="blook-name">${b.name}</div>
          <div class="blook-count">x<span class="count-val" data-id="${b.id}">${count}</span></div>
          <div class="blook-buttons">
            <button class="sell-one" data-id="${b.id}">Sell 1 (${SELL_PRICES[b.rarity]})</button>
            ${count>1 ? `<button class="sell-dups" data-id="${b.id}">Sell All Except 1</button>` : `<button class="sell-dups hidden" data-id="${b.id}">Sell All Except 1</button>`}
          </div>
        </div>
      </div>
    `;
  }
  html += `</div></div><p class="coming-soon">More packs coming soon!</p></div>`;
  content.innerHTML = html;

  content.querySelectorAll(".sell-one").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const current = Number(getBlooks()[id] || 0);
      if (current<=0) return;
      removeBlook(id,1);
      const rarity = BLOOK_CATALOG.find(x=>x.id===id).rarity;
      setTokens(getTokens()+SELL_PRICES[rarity]);
      const countEl = content.querySelector(`.count-val[data-id="${id}"]`);
      if (countEl) countEl.textContent = Number(getBlooks()[id]||0);
      refreshBlookTile(content,id);
      const tokensEl = document.getElementById("tokens-el");
      if (tokensEl) tokensEl.textContent = getTokens();
    });
  });

  content.querySelectorAll(".sell-dups").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const have = Number(getBlooks()[id] || 0);
      if (have <= 1) return;
      const toSell = have - 1;
      const rarity = BLOOK_CATALOG.find(x=>x.id===id).rarity;
      const price = SELL_PRICES[rarity] * toSell;
      const obj = getBlooks(); obj[id] = 1; setBlooks(obj);
      setTokens(getTokens()+price);
      const countEl = content.querySelector(`.count-val[data-id="${id}"]`);
      if (countEl) countEl.textContent = 1;
      refreshBlookTile(content,id);
      const tokensEl = document.getElementById("tokens-el");
      if (tokensEl) tokensEl.textContent = getTokens();
    });
  });
}

function refreshBlookTile(content,id) {
  const count = Number(getBlooks()[id] || 0);
  const dupBtn = content.querySelector(`.sell-dups[data-id="${id}"]`);
  if (!dupBtn) return;
  if (count>1) dupBtn.classList.remove("hidden"); else dupBtn.classList.add("hidden");
}

// small helper formatHMS used earlier
function formatHMS(ms) {
  let s = Math.max(0, Math.floor(ms/1000));
  const h = Math.floor(s/3600); s %= 3600;
  const m = Math.floor(s/60); const sec = s%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// export helpers to global for page scripts
window.app = {
  renderStatsPage,
  renderMarketPage,
  renderBlooksPage,
  getTokens,
  setTokens,
  addBlook,
  getBlooks
};
