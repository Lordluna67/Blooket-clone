// =========================
// Simple Local Account System
// =========================

// Returns current logged-in username, or null
function getCurrentUser() {
    return localStorage.getItem("currentUser");
}

// Logs in a user if account exists
function login(username) {
    localStorage.setItem("currentUser", username);

    // Create starter inventory if first time
    if (!localStorage.getItem(username + "_blooks")) {
        localStorage.setItem(username + "_blooks", JSON.stringify({}));
        localStorage.setItem(username + "_tokens", 0);
    }
}

// Logs out
function logout() {
    localStorage.removeItem("currentUser");
    window.location.reload();
}

// Get token amount
function getTokens() {
    const user = getCurrentUser();
    return parseInt(localStorage.getItem(user + "_tokens")) || 0;
}

// Set token amount
function setTokens(amount) {
    const user = getCurrentUser();
    localStorage.setItem(user + "_tokens", amount);
    updateTokenDisplay();
}

// Adds tokens
function addTokens(amount) {
    setTokens(getTokens() + amount);
}

// =========================
// Blook Handling
// =========================

function getUserBlooks() {
    const user = getCurrentUser();
    return JSON.parse(localStorage.getItem(user + "_blooks")) || {};
}

function saveUserBlooks(data) {
    const user = getCurrentUser();
    localStorage.setItem(user + "_blooks", JSON.stringify(data));
}

// Gives a blook to user
function giveBlook(name) {
    const blooks = getUserBlooks();

    if (!blooks[name]) blooks[name] = 0;
    blooks[name]++;

    saveUserBlooks(blooks);
}

// =========================
// Market Pack Opening
// =========================

// Pack data
const medievalPack = {
    cost: 25,
    blooks: [
        { name: "elf", rarity: "uncommon", chance: 13.5 },
        { name: "witch", rarity: "uncommon", chance: 13.5 },
        { name: "wizard", rarity: "uncommon", chance: 13.5 },
        { name: "fairy", rarity: "uncommon", chance: 13.5 },
        { name: "slimemonster", rarity: "uncommon", chance: 13.5 },

        { name: "jester", rarity: "rare", chance: 9 },
        { name: "dragon", rarity: "rare", chance: 9 },
        { name: "queen", rarity: "rare", chance: 9 },

        { name: "unicorn", rarity: "epic", chance: 5 },

        { name: "king", rarity: "legendary", chance: 1 }
    ]
};

// Roll a random blook
function pickFromPack(pack) {
    let total = 0;
    pack.blooks.forEach(b => total += b.chance);

    let roll = Math.random() * total;
    let current = 0;

    for (const b of pack.blooks) {
        current += b.chance;
        if (roll <= current) return b;
    }
}

// Open the pack
function openPack() {
    if (getTokens() < medievalPack.cost) {
        alert("Not enough tokens!");
        return;
    }

    setTokens(getTokens() - medievalPack.cost);

    const result = pickFromPack(medievalPack);
    giveBlook(result.name);

    showPackAnimation(result);
}

// =========================
// Pack Animation
// =========================

function showPackAnimation(blook) {
    const overlay = document.getElementById("pack-animation");
    const img = document.getElementById("pack-blook-img");
    const name = document.getElementById("pack-blook-name");

    const url = `https://ac.blooket.com/marketassets/blooks/${blook.name}.svg`;
    img.src = url;
    name.textContent = blook.name.charAt(0).toUpperCase() + blook.name.slice(1);

    overlay.style.display = "flex";

    // colored confetti
    startConfetti(blook.rarity);

    overlay.onclick = () => {
        overlay.style.display = "none";
        stopConfetti();
    };
}

// =========================
// Token Display
// =========================
function updateTokenDisplay() {
    const el = document.getElementById("tokens");
    if (el) el.textContent = getTokens();
}
