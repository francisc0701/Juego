<!DOCTYPE html>
<html>
<body>
<canvas id="c"></canvas>
<script src="/socket.io/socket.io.js"></script>
<script>
const socket = io();
const c = document.getElementById("c");
const ctx = c.getContext("2d");
c.width = innerWidth;
c.height = innerHeight;

let players = {};
let keys = {};

document.addEventListener("keydown",e=>keys[e.key]=true);
document.addEventListener("keyup",e=>keys[e.key]=false);

socket.on("state",data=>players=data);

function loop(){
  let dx=0,dy=0;
  if(keys["w"])dy=-2;
  if(keys["s"])dy=2;
  if(keys["a"])dx=-2;
  if(keys["d"])dx=2;

  socket.emit("move",{dx,dy});

  ctx.fillRect(0,0,c.width,c.height);

  for(let id in players){
    let p=players[id];
    ctx.fillStyle="red";
    ctx.fillRect(p.x,p.y,20,20);
  }

  requestAnimationFrame(loop);
}
loop();
</script>
</body>
</html>
