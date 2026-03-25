const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static(__dirname));

let players = {};
let bullets = [];
let coinsMap = [];
let ranking = [];

function spawnCoins(){
  coinsMap = [];
  for(let i=0;i<20;i++){
    coinsMap.push({
      x: Math.random()*2000,
      y: Math.random()*2000
    });
  }
}
spawnCoins();

io.on("connection", socket => {

  players[socket.id] = {
    x: Math.random()*2000,
    y: Math.random()*2000,
    hp:100,
    coins:0,
    name:"Jugador"
  };

  socket.on("setName", name=>{
    if(players[socket.id]){
      players[socket.id].name = name;
    }
  });

  socket.on("move", d=>{
    let p=players[socket.id];
    if(!p)return;
    p.x+=d.dx;
    p.y+=d.dy;
  });

  socket.on("shoot", d=>{
    bullets.push({...d, owner:socket.id});
  });

  socket.on("disconnect", ()=>{
    delete players[socket.id];
  });
});

function updateRanking(){
  ranking = Object.values(players)
    .sort((a,b)=>b.coins-a.coins)
    .slice(0,5);
}

setInterval(()=>{

  bullets.forEach((b,i)=>{
    b.x+=b.dx;
    b.y+=b.dy;

    for(let id in players){
      if(id!==b.owner){
        let p=players[id];
        if(Math.hypot(p.x-b.x,p.y-b.y)<15){
          p.hp-=20;
          bullets.splice(i,1);

          if(p.hp<=0){
            p.hp=100;
            p.x=Math.random()*2000;
            p.y=Math.random()*2000;
          }
        }
      }
    }
  });

  for(let id in players){
    let p=players[id];
    coinsMap.forEach((c,i)=>{
      if(Math.hypot(p.x-c.x,p.y-c.y)<20){
        p.coins++;
        coinsMap.splice(i,1);
      }
    });
  }

  if(coinsMap.length<10) spawnCoins();

  updateRanking();

  io.emit("state",{players,bullets,coinsMap});
  io.emit("ranking", ranking);

},1000/30);

const PORT = process.env.PORT || 3000;
http.listen(PORT);
