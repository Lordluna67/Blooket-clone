/* =========================================================
   SIMPLE LOCAL STORAGE ACCOUNT + INVENTORY APP
   ========================================================= */

const BLOOKS = {
    king: {
        name: "King",
        rarity: "Legendary",
        image: "https://ac.blooket.com/marketassets/blooks/king.svg"
    },
    unicorn: {
        name: "Unicorn",
        rarity: "Epic",
        image: "https://ac.blooket.com/marketassets/blooks/unicorn.svg"
    },
    queen: {
        name: "Queen",
        rarity: "Legendary",
        image: "https://ac.blooket.com/marketassets/blooks/queen.svg"
    },
    jester: {
        name: "Jester",
        rarity: "Rare",
        image: "https://ac.blooket.com/marketassets/blooks/jester.svg"
    },
    slimemonster: {
        name: "Slime Monster",
        rarity: "Uncommon",
        image: "https://ac.blooket.com/marketassets/blooks/slimemonster.svg"
    },
    fairy: {
        name: "Fairy",
        rarity: "Uncommon",
        image: "https://ac.blooket.com/marketassets/blooks/fairy.svg"
    },
    elf: {
        name: "Elf",
        rarity: "Rare",
        image: "https://ac.blooket.com/marketassets/blooks/elf.svg"
    },
    wizard: {
        name: "Wizard",
        rarity: "Epic",
        image: "https://ac.blooket.com/marketassets/blooks/wizard.svg"
    },
    witch: {
        name: "Witch",
        rarity: "Rare",
        image: "https://ac.blooket.com/marketassets/blooks/witch.svg"
    },
    dragon: {
        name: "Dragon",
        rarity: "Legendary",
        image: "https://ac.blooket.com/marketassets/blooks/dragon.svg"
    }
};

const RARITY_VALUES = {
    "Uncommon": 5,
    "Rare": 20,
    "Epic": 75,
    "Legendary": 200
};

/* =========================================================
   ACCOUNT SYSTEM (LOCAL STORAGE ONLY)
   ========================================================= */

function getUsers() {
    return JSON.parse(localStorage.getItem("users") || "{}");
}

function saveUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
}

function createAccount(username, password) {
    const users = getUsers();
    if (users[username]) return false;

    users[username] = {
        username,
        password,
        tokens: 100,
        blooks: {} // inventory
    };

    saveUsers(users);
    return true;
}

function login(username, password) {
    const users = getUsers();
    if (!users[username]) return false;
    if (users[username].password !== password) return false;

    localStorage.setItem("currentUser", username);
    return true;
}

function getCurrentUser() {
    const username = localStorage.getItem("currentUser");
    if (!username) return null;

    const users = getUsers();
    return users[username] || null;
}

function saveCurrentUser(user) {
    const users = getUsers();
    users[user.username] = user;
    saveUsers(users);
}

/* =========================================================
   PACK OPENING SYSTEM
   ========================================================= */

function openPack() {
    const user = getCurrentUser();
    if (!user) return alert("Not logged in!");

    if (user.tokens < 15) return alert("You need 15 tokens!");

    user.tokens -= 15;

    const keys = Object.keys(BLOOKS);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const blook = BLOOKS[randomKey];

    // Add blook to inventory
    user.blooks[randomKey] = (user.blooks[randomKey] || 0) + 1;

    saveCurrentUser(user);

    // ALWAYS show the blook revealed
    showPackReveal(blook);

    return blook;
}

function showPackReveal(blook) {
    const reveal = document.getElementById("packReveal");
    if (!reveal) return;

    reveal.innerHTML = `
        <h2>You got:</h2>
        <img src="${blook.image}" class="bigBlook">
        <p>${blook.name} (${blook.rarity})</p>
    `;
}

/* =========================================================
   BLOOKS PAGE RENDER
   ========================================================= */

function renderBlooksPage() {
    const user = getCurrentUser();
    if (!user) return;

    const container = document.getElementById("blooksContainer");
    if (!container) return;

    container.innerHTML = "";

    for (const key in BLOOKS) {
        const blook = BLOOKS[key];
        const owned = user.blooks[key] || 0;

        const img = owned > 0
            ? blook.image
            : "https://upload.wikimedia.org/wikipedia/commons/5/59/Question_mark_white.svg";

        container.innerHTML += `
            <div class="blookItem">
                <img src="${img}">
                <p>${blook.name}</p>
                <p>Owned: ${owned}</p>
                ${owned > 0 ? renderSellButtons(key, owned) : ""}
            </div>
        `;
    }
}

function renderSellButtons(key, amount) {
    const value = RARITY_VALUES[BLOOKS[key].rarity];
    let html = `<button onclick="sellOne('${key}')">Sell 1 (+${value})</button>`;

    if (amount > 1) {
        html += `<button onclick="sellAllButOne('${key}')">Sell All Except 1 (+${value * (amount - 1)})</button>`;
    }
    return html;
}

/* =========================================================
   SELLING
   ========================================================= */

function sellOne(key) {
    const user = getCurrentUser();
    if (!user.blooks[key]) return;

    const value = RARITY_VALUES[BLOOKS[key].rarity];

    user.blooks[key]--;
    if (user.blooks[key] <= 0) delete user.blooks[key];

    user.tokens += value;

    saveCurrentUser(user);
    renderBlooksPage();
}

function sellAllButOne(key) {
    const user = getCurrentUser();
    const amount = user.blooks[key];
    if (amount <= 1) return;

    const value = RARITY_VALUES[BLOOKS[key].rarity] * (amount - 1);

    user.blooks[key] = 1;
    user.tokens += value;

    saveCurrentUser(user);
    renderBlooksPage();
}

/* =========================================================
   PAGE INITIALIZERS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("blooksContainer")) {
        renderBlooksPage();
    }
});
