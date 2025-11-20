// =======================
// Firebase User Helpers
// =======================
function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getUserEmail() {
    const user = getCurrentUser();
    return user ? user.email : null;
}

// =======================
// Token Logic
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
    updateTokenDisplay();
}

function updateTokenDisplay() {
    const tokensSpan = document.getElementById("tokens");
    if (tokensSpan) tokensSpan.textContent = getUserTokens();
}

// =======================
// User Blook Inventory
// =======================
function getUserBlooks() {
    const email = getUserEmail();
    if (!email) return {};
    return JSON.parse(localStorage.getItem(email + "_blooks")) || {};
}

function setUserBlooks(obj) {
    const email = getUserEmail();
    if (!email) return;
    localStorage.setItem(email + "_blooks", JSON.stringify(obj));
}

// =======================
// Medieval Pack Loot Table
// =======================
const medievalPack = [
    { name: "Elf", rarity: "uncommon", image: "https://ac.blooket.com/marketassets/blooks/elf.svg", weight: 25 },
    { name: "Witch", rarity: "uncommon", image: "https://ac.blooket.com/marketassets/blooks/witch.svg", weight: 25 },
    { name: "Wizard", rarity: "uncommon", image: "https://ac.blooket.com/marketassets/blooks/wizard.svg", weight: 25 },
    { name: "Fairy", rarity: "uncommon", image: "https://ac.blooket.com/marketassets/blooks/fairy.svg", weight: 25 },
    { name: "Slime Monster", rarity: "uncommon", image: "https://ac.blooket.com/marketassets/blooks/slimemonster.svg", weight: 25 },

    { name: "Jester", rarity: "rare", image: "https://ac.blooket.com/marketassets/blooks/jester.svg", weight: 10 },
    { name: "Dragon", rarity: "rare", image: "https://ac.blooket.com/marketassets/blooks/dragon.svg", weight: 10 },
    { name: "Queen", rarity: "rare", image: "https://ac.blooket.com/marketassets/blooks/queen.svg", weight: 10 },

    { name: "Unicorn", rarity: "epic", image: "https://ac.blooket.com/marketassets/blooks/unicorn.svg", weight: 3 },

    { name: "King", rarity: "legendary", image: "https://ac.blooket.com/marketassets/blooks/king.svg", weight: 1 }
];

// =======================
// Random Blook Selection
// =======================
function rollMedievalPack() {
    let totalWeight = medievalPack.reduce((sum, b) => sum + b.weight, 0);
    let roll = Math.random() * totalWeight;

    for (let b of medievalPack) {
        if (roll < b.weight) return b;
        roll -= b.weight;
    }
}

// =======================
// Market Pack Opening Logic
// =======================
function openMedievalPack() {
    const tokens = getUserTokens();
    if (tokens < 25) {
        alert("You do not have enough tokens!");
        return;
    }

    setUserTokens(tokens - 25);

    const result = rollMedievalPack();

    // Give blook to user
    let inv = getUserBlooks();
    inv[result.name] = (inv[result.name] || 0) + 1;
    setUserBlooks(inv);

    // Show animation card
    const container = document.getElementById("pack-result-container");
    container.innerHTML = `
        <div class="flip-card">
            <div class="flip-card-inner">
                <div class="flip-card-front">
                    <div class="pack-front">Medieval Pack</div>
                </div>
                <div class="flip-card-back">
                    <img src="${result.image}" class="blook-image">
                    <h3 class="blook-name">${result.name}</h3>
                </div>
            </div>
        </div>
    `;

    setTimeout(() => {
        document.querySelector(".flip-card-inner").classList.add("flip");
    }, 200);
}

// =======================
// Update Blooks Tab
// =======================
function renderMyBlooks() {
    const main = document.getElementById("tab-content");
    const inv = getUserBlooks();

    let html = `
        <h1>My Blooks</h1>
        <div class="my-blooks-grid">
    `;

    for (let b of medievalPack) {
        const count = inv[b.name] || 0;
        html += `
            <div class="my-blook-card ${b.rarity}">
                <img src="${b.image}">
                <div>${b.name}</div>
                <div>Owned: ${count}</div>
            </div>
        `;
    }

    html += `</div>`;
    main.innerHTML = html;
}

// =======================
// TAB SYSTEM
// =======================
function showTab(tabName) {
    const main = document.getElementById("tab-content");
    const title = document.getElementById("tab-title");

    title.textContent = tabName.toUpperCase();

    switch (tabName) {

        case "market":
            main.innerHTML = `
                <h2>Medieval Pack — 25 Tokens</h2>
                <button id="buy-pack-btn">Open Pack</button>

                <div id="pack-result-container" style="margin-top:20px;"></div>
            `;
            document.getElementById("buy-pack-btn").addEventListener("click", openMedievalPack);
            break;

        case "blooks":
            renderMyBlooks();
            break;

        case "stats":
            main.innerHTML = `
                <p>Email: <span id="user-email"></span></p>
                <p>Tokens: <span id="tokens">0</span></p>
            `;
            document.getElementById("user-email").textContent = getUserEmail();
            updateTokenDisplay();
            break;

        default:
            main.innerHTML = "<p>Unknown tab.</p>";
    }
}

// =======================
// LOGOUT
// =======================
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = "login.html";
    });
}

// =======================
// INITIALIZE
// =======================
window.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if (!user) {
            window.location.href = "login.html";
        } else {
            showTab("stats");
        }
    });
});
