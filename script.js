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
// Daily Spin Logic
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
// TAB SYSTEM
// =======================
function showTab(tabName) {
    const main = document.getElementById("tab-content");
    const title = document.getElementById("tab-title");

    title.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);

    switch(tabName) {

        // -------------------
        // STATS TAB
        // -------------------
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

                document.getElementById("user-email").textContent = user.email;
                updateTokenDisplay();
                updateDailySpinDisplay();
                document.getElementById("daily-spin-btn").addEventListener("click", spinDaily);
            }
            break;

        // -------------------
        // MARKET TAB
        // -------------------
        case "market":
            main.innerHTML = `
                <h2>Medieval Pack — 25 Tokens</h2>
                <button id="buy-pack-btn">Open Pack</button>
                <p style="margin-top:10px; opacity:0.8;">Pack animation coming soon!</p>
            `;
            break;

        // -------------------
        // BIZZAR TAB
        // -------------------
        case "bizzar":
            main.innerHTML = `
                <h2>Bizzar</h2>
                <p>Coming soon!</p>
            `;
            break;

        // -------------------
        // BLOOKS TAB
        // -------------------
        case "blooks":
            main.innerHTML = `
                <div class="blooks-page">

                    <h1 class="blooks-title">My Blooks</h1>

                    <div class="pack-container">
                        <h2 class="pack-title">Medieval Pack</h2>

                        <div class="blook-grid">

                            <!-- Uncommons -->
                            <div class="blook-card uncommon">Elf</div>
                            <div class="blook-card uncommon">Witch</div>
                            <div class="blook-card uncommon">Wizard</div>
                            <div class="blook-card uncommon">Fairy</div>
                            <div class="blook-card uncommon">Slime Monster</div>

                            <!-- Rares -->
                            <div class="blook-card rare">Jester</div>
                            <div class="blook-card rare">Dragon</div>
                            <div class="blook-card rare">Queen</div>

                            <!-- Epic -->
                            <div class="blook-card epic">Unicorn</div>

                            <!-- Legendary -->
                            <div class="blook-card legendary">King</div>

                        </div>
                    </div>

                    <p class="coming-soon">More packs coming soon!</p>

                </div>
            `;
            break;

        // -------------------
        default:
            main.innerHTML = `<p>Unknown tab.</p>`;
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
