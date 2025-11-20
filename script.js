// Shared data
};
}


// Buy pack
if(document.getElementById("buyPack")){
const u = loadUser();
const out = document.getElementById("packResult");


document.getElementById("buyPack").onclick = ()=>{
if(u.tokens < medievalPack.cost){ out.textContent="Not enough tokens!"; return; }
u.tokens -= medievalPack.cost;


const roll = Math.random()*100;
let sum = 0;
let reward;
for(const item of medievalPack.items){ sum+=item.chance; if(roll<=sum){ reward=item; break; } }


if(!u.blooks[reward.name]) u.blooks[reward.name] = 0;
u.blooks[reward.name]++;
saveUser(u);


out.innerHTML = `<h2>You got: ${reward.name}</h2><img src="${reward.img}" class="packImg">`;
};
}


// Render blooks
if(document.getElementById("blookGrid")){
const u = loadUser();
const grid = document.getElementById("blookGrid");
grid.innerHTML = Object.keys(u.blooks).map(name=>{
const item = medievalPack.items.find(i=>i.name===name);
const count = u.blooks[name];
return `<div class='bCard'>
<img src='${item.img}'>
<p>${name} x${count}</p>
<button onclick="sellOne('${name}')">Sell One</button>
${count>1?`<button onclick="sellKeepOne('${name}')">Sell All Except One</button>`:""}
</div>`;
}).join("");
}


function sellOne(name){
const u = loadUser();
if(!u.blooks[name]) return;
const item = medievalPack.items.find(i=>i.name===name);
u.blooks[name]--;
u.tokens += rarityValue[item.rarity];
if(u.blooks[name]<=0) delete u.blooks[name];
saveUser(u);
location.reload();
}


function sellKeepOne(name){
const u = loadUser();
const item = medievalPack.items.find(i=>i.name===name);
const count = u.blooks[name] - 1;
if(count>0) u.tokens += count * rarityValue[item.rarity];
u.blooks[name] = 1;
saveUser(u);
location.reload();
}
