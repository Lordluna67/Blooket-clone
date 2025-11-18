// =======================
// Helper Functions
// =======================
function getCurrentUser() {
    return firebase.auth().currentUser;
}

function getUserEmail() {
    const user = getCurrentUser();
    return user ? user.email : null;
}

// =======================
// Token Functions
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
// Daily Spin Functions
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
        alert("Daily spin not available yet! Come back later.");
        return;
    }
    const reward = Math.floor(Math.random() * 501) + 500; // 500–1000 tokens
    alert(`You spun the daily wheel and earned ${reward} tokens!`);
    setUserTokens(getUserTokens() + reward);

    const data = getDailySpinData();
    data.lastSpin = Date.now();
    data.available = false;
    setDailySpinData(data);

    updateDailySpinDisplay();
}

// =======================
// Countdown Timer
// =======================
function getRemainingSpinTime() {
    const data = getDailySpinData();
    if (!data) return 0;
    const now = Date.now();
    const twelveHours = 12 * 60 * 60 * 1000;
    const elapsed = now - data.lastSpin;
    const remaining = Math.max(twelveHours - elapsed, 0);
    return remaining;
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
        const remaining = getRemainingSpinTime();
        span.textContent += ` (${formatTime(remaining)} until next spin)`;
    }
}

setInterval(() => {
    const span = document.getElementById("dailySpin");
    if (span) updateDailySpinDisplay();
}, 1000);

// =======================
// Tabs
// =======================
function showTab(tabName) {
    const main = document.getElementById("tab-content");
    const title = document.getElementById("tab-title");
    title.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);

    switch(tabName) {
        case "stats":
            main.innerHTML = `
                <p id="user-email"></p>
                <p>Tokens: <span id="tokens">0</span></p>
                <p>Daily Spin Available: <span id="dailySpin">Yes</span></p>
                <button id="daily-spin-btn">Spin Daily Wheel</button>
            `;
            const user = getCurrentUser();
            if(user) {
                const email = getUserEmail();

                // Initialize tokens & daily spin if not present
                if (!localStorage.getItem(email + "_tokens")) {
                    localStorage.setItem(email + "_tokens", 0);
                }
                if (!localStorage.getItem(email + "_dailySpinData")) {
                    localStorage.setItem(email + "_dailySpinData", JSON.stringify({ lastSpin: 0, available: true }));
                }

                document.getElementById("user-email").textContent = "Email: " + user.email;
                updateTokenDisplay();
                updateDailySpinDisplay();

                document.getElementById("daily-spin-btn").addEventListener("click", spinDaily);
            }
            break;

        case "market":
        case "bizzar":
        case "blooks":
            main.innerHTML = `<p>${tabName} page coming soon!</p>`;
            break;

        default:
            main.innerHTML = `<p>Unknown tab</p>`;
    }
}

// =======================
// Logout
// =======================
function logout() {
    firebase.auth().signOut().then(() => window.location.href = "login.html");
}

// =======================
// Game Canvas Placeholder
// =======================
function setupGameCanvas() {
    const canvas = document.getElementById("gameCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#222";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let x = canvas.width / 2;
    let y = canvas.height / 2;
    let dx = 2;
    let dy = 2;
    const radius = 20;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#222";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();
        ctx.closePath();

        x += dx;
        y += dy;

        if(x + radius > canvas.width || x - radius < 0) dx = -dx;
        if(y + radius > canvas.height || y - radius < 0) dy = -dy;

        requestAnimationFrame(animate);
    }

    animate();
}

// =======================
// Initialize
// =======================
window.addEventListener("DOMContentLoaded", () => {
    firebase.auth().onAuthStateChanged(user => {
        if(!user) window.location.href = "login.html";
        if(user) showTab("stats");
    });

    setupGameCanvas();
});
