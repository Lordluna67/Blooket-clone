// =======================
// script.js (FULL - overwrite existing)
// =======================

// =======================
// Firebase User Helpers (existing)
// =======================
function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getUserEmail() {
    const user = getCurrentUser();
    return user ? user.email : null;
}

// -----------------------
// Inventory helpers (per-email stored in localStorage)
// Key: <email>_blooks -> JSON object { elf:2, dragon:1, ... }
// -----------------------
function _getBlooksKey(email) {
    return email + "_blooks";
}

function getBlooksObject() {
    const email = getUserEmail();
    if (!email) return {};
    try {
        return JSON.parse(localStorage.getItem(_getBlooksKey(email))) || {};
    } catch (e) {
        return {};
    }
}

function setBlooksObject(obj) {
    const email = getUserEmail();
    if (!email) return;
    localStorage.setItem(_getBlooksKey(email), JSON.stringify(obj));
}

function addBlook(id, count = 1) {
    const obj = getBlooksObject();
    obj[id] = (obj[id] || 0) + Number(count);
    setBlooksObject(obj);
}

function removeBlook(id, count = 1) {
    const obj = getBlooksObject();
    if (!obj[id]) return;
    obj[id] = obj[id] - Number(count);
    if (obj[id] <= 0) delete obj[id];
    setBlooksObject(obj);
}

// =======================
// Token Logic (existing, unchanged)
// =======================
function getUserTokens() {
    const email = getUserEmail();
    if (!email) return 0;
    return parseInt(localStorage.getItem(email + "_tokens")) || 0;
}

function setUserTokens(amount) {
    const email = getUserEmail();
    if (!email) return;
    localStorage.setItem(email + "_tokens", amount);
    updateTokenDisplays();
}

function updateTokenDisplays() {
    // multiple possible token displays in UI
    const tokensSpan = document.getElementById("tokens");
    if (tokensSpan) tokensSpan.textContent = getUserTokens();
    const tokensEl = document.getElementById("tokens-el");
    if (tokensEl) tokensEl.textContent = getUserTokens();
}

// =======================
// Daily Spin Logic (existing)
// =======================
function getDailySpinData() {
    const email = getUserEmail();
    if (!email) return null;
    const data = JSON.parse(localStorage.getItem(email + "_dailySpinData"));
    return data || { lastSpin: 0, available: true };
}

function setDailySpinData(data) {
    const email = getUserEmail();
    if (!email) return;
    localStorage.setItem(email + "_dailySpinData", JSON.stringify(data));
}

function isDailySpinAvailable() {
    const data = getDailySpinData();
    if (!data) return false;

    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;

    if (now - data.lastSpin >= twelveHours) {
        data.available = true;
        setDailySpinData(data);
    }

    return data.available;
}

function spinDaily() {
    if (!isDailySpinAvailable()) {
        alert("Daily spin not available yet!");
        return;
    }

    const reward = Math.floor(Math.random() * 501) + 500; // 500–1000
    alert(`You earned ${reward} tokens!`);

    setUserTokens(getUserTokens() + reward);

    const data = getDailySpinData();
    data.lastSpin = Date.now();
    data.available = false;
    setDailySpinData(data);

    updateDailySpinDisplay();
}

function getRemainingSpinTime() {
    const data = getDailySpinData();
    if (!data) return 0;

    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    return Math.max(twelveHours - (now - data.lastSpin), 0);
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    totalSeconds %= 3600;
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateDailySpinDisplay() {
    const span = document.getElementById("dailySpin");
    if (!span) return;

    const available = isDailySpinAvailable();
    span.textContent = available ? "Yes" : "No";

    if (!available) {
        span.textContent += ` (${formatTime(getRemainingSpinTime())})`;
    }
}

setInterval(updateDailySpinDisplay, 1000);

// =======================
// Blook catalog & images (Medieval pack)
// =======================
const BLOOK_CATALOG = [
    { id: "elf", name: "Elf", rarity: "uncommon", img: "https://ac.blooket.com/marketassets/blooks/elf.svg" },
    { id: "witch", name: "Witch", rarity: "uncommon", img: "https://ac.blooket.com/marketassets/blooks/witch.svg" },
    { id: "wizard", name: "Wizard", rarity: "uncommon", img: "https://ac.blooket.com/marketassets/blooks/wizard.svg" },
    { id: "fairy", name: "Fairy", rarity: "uncommon", img: "https://ac.blooket.com/marketassets/blooks/fairy.svg" },
    { id: "slime_monster", name: "Slime Monster", rarity: "uncommon", img: "https://ac.blooket.com/marketassets/blooks/slimemonster.svg" },

    { id: "jester", name: "Jester", rarity: "rare", img: "https://ac.blooket.com/marketassets/blooks/jester.svg" },
    { id: "dragon", name: "Dragon", rarity: "rare", img: "https://ac.blooket.com/marketassets/blooks/dragon.svg" },
    { id: "queen", name: "Queen", rarity: "rare", img: "https://ac.blooket.com/marketassets/blooks/queen.svg" },

    { id: "unicorn", name: "Unicorn", rarity: "epic", img: "https://ac.blooket.com/marketassets/blooks/unicorn.svg" },
    { id: "king", name: "King", rarity: "legendary", img: "https://ac.blooket.com/marketassets/blooks/king.svg" }
];

// Map rarity -> sell price
const SELL_PRICES = {
    uncommon: 5,
    rare: 20,
    epic: 75,
    legendary: 200
};

// ----------------------
// Pack definition and picker
// ----------------------
const MEDIEVAL_PACK = {
    id: "medieval_pack",
    name: "Medieval Pack",
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

function pickFromPack(pack) {
    const total = pack.items.reduce((s, it) => s + it.weight, 0);
    const r = Math.random() * total;
    let cum = 0;
    for (let it of pack.items) {
        cum += it.weight;
        if (r <= cum) return BLOOK_CATALOG.find(b => b.id === it.id);
    }
    return BLOOK_CATALOG.find(b => b.id === pack.items[pack.items.length - 1].id);
}

// =======================
// Pack reveal overlay + confetti (stays until user clicks)
// =======================
function showPackReveal(blook) {
    // overlay
    const overlay = document.createElement("div");
    overlay.className = "pack-overlay";

    // reveal card
    const card = document.createElement("div");
    card.className = "pack-card-reveal";
    card.innerHTML = `
        <div class="pack-title">You got...</div>
        <img src="${blook.img}" class="reveal-img" alt="${escapeHtml(blook.name)}" />
        <div class="blook-name ${blook.rarity}">${escapeHtml(blook.name)}</div>
        <div class="pack-sub">Click anywhere to continue</div>
    `;

    // confetti canvas
    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    overlay.appendChild(canvas);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // start confetti
    const controller = startConfetti(canvas, blook.rarity);

    function remove() {
        controller.stop();
        overlay.classList.add("fade-out");
        setTimeout(() => overlay.remove(), 300);
        document.removeEventListener("click", onDocClick, true);
    }

    function onDocClick(e) {
        // only dismiss if clicked anywhere on overlay
        if (overlay.contains(e.target)) remove();
    }

    document.addEventListener("click", onDocClick, true);
}

// small HTML escape
function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
}

// Confetti engine (canvas), similar to earlier but self-contained
function startConfetti(canvas, rarity) {
    const colors = {
        uncommon: ["#2ecc71","#27ae60"],
        rare: ["#3498db","#2e86de"],
        epic: ["#e74c3c","#c0392b"],
        legendary: ["#f39c12","#f1c40f"]
    };
    const palette = colors[rarity] || ["#ffffff"];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const ctx = canvas.getContext("2d");
    let running = true;
    const particles = [];
    const count = 120;

    function createParticle() {
        const cx = Math.random() * canvas.width;
        const cy = Math.random() * (canvas.height * 0.4);
        const vx = (Math.random() - 0.5) * 6;
        const vy = Math.random() * 6 + 2;
        const size = Math.random() * 8 + 4;
        const color = palette[Math.floor(Math.random() * palette.length)];
        const rot = Math.random() * Math.PI * 2;
        const spin = (Math.random() - 0.5) * 0.2;
        return { x: cx, y: cy, vx, vy, size, color, rot, spin, life: 300 + Math.random()*200 };
    }

    for (let i = 0; i < count; i++) particles.push(createParticle());

    let rafId;
    function update() {
        if (!running) return;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.12;
            p.rot += p.spin;
            p.life--;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size * 0.6);
            ctx.restore();
            if (p.y > canvas.height + 50 || p.life <= 0) {
                const idx = particles.indexOf(p);
                particles[idx] = createParticle();
            }
        }
        rafId = requestAnimationFrame(update);
    }

    update();

    return {
        stop() {
            running = false;
            cancelAnimationFrame(rafId);
            ctx.clearRect(0,0,canvas.width,canvas.height);
            window.removeEventListener("resize", resize);
            if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
        }
    };
}

// =======================
// Blooks rendering (layout C matched to screenshot)
// Replaces the previous 'blooks' case in showTab
// =======================
function renderBlooksTab(main) {
    // build grid HTML using catalog and user's counts
    const inventory = getBlooksObject(); // { elf:2, ... }
    let html = `<div class="blooks-page">
        <h1 class="blooks-title">My Blooks</h1>
        <div class="pack-container">
          <h2 class="pack-title">Medieval Pack</h2>
          <div class="blook-grid">`;

    for (const b of BLOOK_CATALOG) {
        const count = Number(inventory[b.id] || 0);
        html += `
          <div class="blook-tile">
            <div class="blook-circle ${b.rarity}">
              <img src="${b.img}" alt="${escapeHtml(b.name)}" class="blook-img">
            </div>
            <div class="blook-meta">
              <div class="blook-name">${escapeHtml(b.name)}</div>
              <div class="blook-count">x<span class="count-val" data-id="${b.id}">${count}</span></div>
              <div class="blook-buttons">
                <button class="sell-one" data-id="${b.id}">Sell 1 (${SELL_PRICES[b.rarity]})</button>
                ${count > 1 ? `<button class="sell-dups" data-id="${b.id}">Sell All Except 1</button>` : `<button class="sell-dups hidden" data-id="${b.id}">Sell All Except 1</button>`}
              </div>
            </div>
          </div>
        `;
    }

    html += `</div></div><p class="coming-soon">More packs coming soon!</p></div>`;

    main.innerHTML = html;

    // wire up buttons
    main.querySelectorAll(".sell-one").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const inv = getBlooksObject();
            const have = Number(inv[id] || 0);
            if (have <= 0) return;
            // remove one, add tokens
            removeBlook(id, 1);
            const rarity = BLOOK_CATALOG.find(b => b.id === id).rarity;
            const price = SELL_PRICES[rarity];
            setUserTokens(getUserTokens() + price);

            // update UI count and token display
            const el = main.querySelector(`.count-val[data-id="${id}"]`);
            if (el) el.textContent = Number((getBlooksObject()[id] || 0));
            updateTokenDisplays();
            // refresh dups button state
            refreshBlookTile(main, id);
        });
    });

    main.querySelectorAll(".sell-dups").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-id");
            const inv = getBlooksObject();
            const have = Number(inv[id] || 0);
            if (have <= 1) return;
            const toSell = have - 1;
            const rarity = BLOOK_CATALOG.find(b => b.id === id).rarity;
            const price = SELL_PRICES[rarity] * toSell;
            // set remaining to 1
            const newObj = getBlooksObject();
            newObj[id] = 1;
            setBlooksObject(newObj);
            setUserTokens(getUserTokens() + price);
            // update UI
            const el = main.querySelector(`.count-val[data-id="${id}"]`);
            if (el) el.textContent = 1;
            updateTokenDisplays();
            refreshBlookTile(main, id);
        });
    });
}

function refreshBlookTile(main, id) {
    // show/hide the Sell All Except 1 button depending on count
    const count = Number(getBlooksObject()[id] || 0);
    const dupBtn = main.querySelector(`.sell-dups[data-id="${id}"]`);
    if (!dupBtn) return;
    if (count > 1) dupBtn.classList.remove("hidden");
    else dupBtn.classList.add("hidden");
}

// =======================
// ShowTab override to use renderBlooksTab for 'blooks' case.
// Replaces the earlier showTab function's 'blooks' block.
// =======================
// We'll modify showTab by wrapping earlier function; define a new full showTab
function showTab(tabName) {
    const main = document.getElementById("tab-content");
    const title = document.getElementById("tab-title");
    if (!main || !title) return;
    title.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);

    switch(tabName) {
        case "stats":
            main.innerHTML = `
                <p>Email: <span id="user-email"></span></p>
                <p>Tokens: <span id="tokens">0</span></p>

                <h3>Daily Spin</h3>
                <p>Available: <span id="dailySpin"></span></p>
                <button id="daily-spin-btn">Spin Daily Wheel</button>
            `;

            const user = getCurrentUser();

            if (user) {
                const email = getUserEmail();

                if (!localStorage.getItem(email + "_tokens")) {
                    localStorage.setItem(email + "_tokens", 0);
                }
                if (!localStorage.getItem(email + "_dailySpinData")) {
                    localStorage.setItem(email + "_dailySpinData", JSON.stringify({
                        lastSpin: 0,
                        available: true
                    }));
                }
                if (!localStorage.getItem(email + "_blooks")) {
                    // initialize blooks object so keys exist (defaults to 0)
                    localStorage.setItem(email + "_blooks", JSON.stringify({}));
                }

                document.getElementById("user-email").textContent = user.email;
                updateTokenDisplays();
                updateDailySpinDisplay();

                const btn = document.getElementById("daily-spin-btn");
                if (btn) btn.addEventListener("click", spinDaily);
            }
            break;

        case "market":
            // use the local uploaded screenshot as a background image for the pack card
            // developer-provided local path: /mnt/data/5f607bd7-a94c-4bcd-877a-60fc9b17b7c6.png
            main.innerHTML = `
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
                const tokens = getUserTokens();
                const msg = document.getElementById("market-msg");
                if (tokens < MEDIEVAL_PACK.cost) {
                    msg.textContent = "Not enough tokens to open the Medieval Pack.";
                    msg.style.color = "crimson";
                    return;
                }

                // Deduct cost
                setUserTokens(tokens - MEDIEVAL_PACK.cost);

                // Pick blook
                const picked = pickFromPack(MEDIEVAL_PACK);

                // Add to inventory
                addBlook(picked.id, 1);

                // Show reveal (stays until click)
                showPackReveal(picked);

                // Update token / stats UI if open
                updateTokenDisplays();
            });
            break;

        case "bizzar":
            main.innerHTML = `
                <h2>Bizzar</h2>
                <p>Coming soon!</p>
            `;
            break;

        case "blooks":
            renderBlooksTab(main);
            break;

        default:
            main.innerHTML = `<p>Unknown tab.</p>`;
    }
}

// =======================
// small canvas placeholder for game area (unchanged)
function setupGameCanvas() {
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

// =======================
// Initialize — ensure auth then show stats by default
window.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            // ensure blooks store exists for user
            const email = getUserEmail();
            if (email && !localStorage.getItem(email + "_blooks")) {
                localStorage.setItem(email + "_blooks", JSON.stringify({}));
            }
            showTab("stats");
            setupGameCanvas();
        }
    });
});
