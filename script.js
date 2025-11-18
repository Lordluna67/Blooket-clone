const currentUser = localStorage.getItem("currentUser");
if (!currentUser) window.location.href = "login.html";

const tokensEl = document.getElementById("tokens");
const spinBtn = document.getElementById("spin-btn");
const spinResult = document.getElementById("spin-result");
const spinTimer = document.getElementById("spin-timer");

function getTokens() {
    return Number(localStorage.getItem(currentUser + "_tokens")) || 0;
}
function setTokens(amount) {
    localStorage.setItem(currentUser + "_tokens", amount);
}

function getNextSpin() {
    return Number(localStorage.getItem(currentUser + "_nextSpin")) || 0;
}
function setNextSpin(timestamp) {
    localStorage.setItem(currentUser + "_nextSpin", timestamp);
}

function updateTokensDisplay() {
    tokensEl.textContent = getTokens();
}

function updateTimer() {
    const now = Date.now();
    const nextSpin = getNextSpin();

    if (now >= nextSpin) {
        spinTimer.textContent = "You can spin now!";
        spinBtn.disabled = false;
        return;
    }

    let remaining = nextSpin - now;

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    remaining %= (1000 * 60 * 60);
    const minutes = Math.floor(remaining / (1000 * 60));
    remaining %= (1000 * 60);
    const seconds = Math.floor(remaining / 1000);

    spinTimer.textContent = `Next spin in ${hours}h ${minutes}m ${seconds}s`;
    spinBtn.disabled = true;
}

setInterval(updateTimer, 1000);
updateTokensDisplay();
updateTimer();

spinBtn.addEventListener("click", () => {
    const now = Date.now();
    const nextSpin = getNextSpin();

    if (now < nextSpin) return;

    const reward = Math.floor(Math.random() * 501) + 500; // 500–1000
    setTokens(getTokens() + reward);
    updateTokensDisplay();

    spinResult.textContent = `You won ${reward} tokens!`;

    const twelveHours = 12 * 60 * 60 * 1000;
    setNextSpin(now + twelveHours);
    updateTimer();
});
