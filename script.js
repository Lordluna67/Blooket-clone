// script.js - canvas placeholder for stats page
window.addEventListener("DOMContentLoaded", () => {
  // call app.renderStatsPage if present
  if (window.app && typeof window.app.renderStatsPage === "function") {
    window.app.renderStatsPage();
  }

  // also wire up sidebar links to render page-specific content on single-page nav
  document.querySelectorAll(".side-link").forEach(a=>{
    a.addEventListener("click", (e)=>{
      // allow normal navigation for multi-page build (links point to separate pages)
      // On same page, we might intercept - here we redirect as normal.
    });
  });

  // logout link
  const logout = document.getElementById("logout-link");
  if (logout) logout.addEventListener("click", (e)=>{ e.preventDefault(); logoutLocal(); window.location.href="login.html"; });

  // canvas animation
  const canvas = document.getElementById("gameCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = canvas.width, h = canvas.height;
  let x = w/2, y = h/2, dx = 2, dy = 2, r = 20;
  function loop(){
    ctx.fillStyle = "#111"; ctx.fillRect(0,0,w,h);
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle="#ffcc00"; ctx.fill(); ctx.closePath();
    x+=dx; y+=dy;
    if (x-r<0 || x+r>w) dx=-dx;
    if (y-r<0 || y+r>h) dy=-dy;
    requestAnimationFrame(loop);
  }
  loop();
});
