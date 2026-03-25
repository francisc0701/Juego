<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Battle Royale GOD</title>
<style>
body{margin:0;background:black;overflow:hidden;font-family:Arial;}
#hud{position:absolute;top:10px;left:10px;color:white;}
#coins{position:absolute;top:40px;left:10px;color:gold;}
#rank{position:absolute;right:10px;top:10px;color:white;}
#login{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:black;padding:20px;}
#shop{position:absolute;top:80px;left:10px;background:black;padding:10px;display:none;}
</style>
</head>
<body>

<div id="login">
<input id="name" placeholder="Tu nombre">
<button onclick="start()">Entrar</button>
</div>

<div id="hud">HP: <span id="hp">100</span></div>
<div id="coins">💰 0</div>
<div id="rank"></div>

<button onclick="toggleShop()" style="position:absolute;top:70px;left:10px;">🛒</button>

<div id="shop">
<button onclick="buySkin('cyan')">Default (0)</button><br>
<button onclick="buySkin('red')">Rojo (10)</button><br>
<button onclick="buySkin('green')">Verde (20)</button><br>
<button onclick="buySkin('gold')">Dorado (50)</button>
</div>

<canvas id="c"></canvas>

<audio id="shoot" src="https://www.soundjay.com/button/beep-07.wav"></audio>

<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();

let username = localStorage.getItem("user") || "";
let mySkin = localStorage.getItem("skin") || "cyan";

function start(){
  username = document.getElementById("name").value;
  localStorage.setItem("user", username);
  document.getElementById("login").style.display="none";
  socket.emit("setName", username);
}

function toggleShop(){
  let s=document.getElementById("shop");
  s.style.display=s.style.display==="none"?"block":"none";
}

function buySkin(color){
  let me=players[myId];
  let prices={cyan:0,red:10,green:20,gold:50};

  if(me.coins>=prices[color]){
    me.coins-=prices[color];
    mySkin=color;
    localStorage.setItem("skin",color);
  }
}

const c=document.getElementById("c");
const ctx=c.getContext("2d");
c.width=innerWidth;
c.height=innerHeight;

let players={},bullets=[],coinsMap=[],myId;

socket.on("connect",()=>myId=socket.id);

socket.on("state",data=>{
players=data.players;
bullets=data.bullets;
coinsMap=data.coinsMap;

let me=players[myId];
if(me){
hp.innerText=me.hp;
document.getElementById("coins").innerText="💰 "+me.coins;
}
});

socket.on("ranking",data=>{
let text="🏆 Ranking<br>";
data.forEach(p=>{
text+=p.name+" - "+p.coins+"<br>";
});
document.getElementById("rank").innerHTML=text;
});

let keys={};
document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

document.addEventListener("click",shoot);

function shoot(){
let me=players[myId];
if(!me)return;

let angle=Math.random()*Math.PI*2;

socket.emit("shoot",{x:me.x,y:me.y,dx:Math.cos(angle)*6,dy:Math.sin(angle)*6});
document.getElementById("shoot").play();
}

function update(){
let dx=0,dy=0;
if(keys["w"])dy=-3;
if(keys["s"])dy=3;
if(keys["a"])dx=-3;
if(keys["d"])dx=3;

socket.emit("move",{dx,dy});
}

function draw(){
ctx.fillStyle="black";
ctx.fillRect(0,0,c.width,c.height);

let me=players[myId];
let camX=me?me.x-c.width/2:0;
let camY=me?me.y-c.height/2:0;

ctx.fillStyle="gold";
coinsMap.forEach(co=>{
ctx.beginPath();
ctx.arc(co.x-camX,co.y-camY,8,0,Math.PI*2);
ctx.fill();
});

for(let id in players){
let p=players[id];

if(id===myId){
ctx.fillStyle=mySkin;
}else{
ctx.fillStyle="red";
}

ctx.beginPath();
ctx.arc(p.x-camX,p.y-camY,15,0,Math.PI*2);
ctx.fill();
}

ctx.fillStyle="yellow";
bullets.forEach(b=>{
ctx.beginPath();
ctx.arc(b.x-camX,b.y-camY,5,0,Math.PI*2);
ctx.fill();
});
}

function loop(){
update();
draw();
requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>
