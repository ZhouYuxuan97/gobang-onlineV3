var socket =io('ws://192.168.123.94:3000');
var color = '';
var GRID_SIZE = 20;
var HORIZONTAL_SIZE = null;
var VERTICAL_SIZE = null;
var checkerBoard = [];
var turn = '';
var roomId = '';

var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');

socket.on('conn', function(data){
   console.log(data);
   color = data.color;
   document.querySelector('#color').innerHTML = 'You are ' + color + ', in Room ' + roomId;
   if(color=='visitor'){
      document.getElementById('restart').disabled = true;
   }

   HORIZONTAL_SIZE = data.hs;
   VERTICAL_SIZE = data.vs;

   cvs.width = HORIZONTAL_SIZE * GRID_SIZE;
   cvs.height = VERTICAL_SIZE * GRID_SIZE;

   // if(data.num == 2){
   //    init();
   // }
});

socket.on('getCheckerBoard', function(data){
   console.log('receive checkerboard from server ' );
   console.log( data);
   checkerBoard = data.checkerBoard;
   turn = data.turn;
   drawCheckerBoard();
   if(color == turn){
      cvs.onclick = putChess;
   }else{
      cvs.onclick = null;
   };

   document.querySelector('#info').innerHTML = 'Now ' + turn + ' turn';

   // if(!cvs.onclick){
   //    cvs.onclick = putChess;
   // }
});

function init(){
//   drawCheckerBoard();
   if(color =='visitor'){
      return;
   }
   console.log('2 players,init');
}


/**
 * event of putting chess
 * @param e
 */
function putChess(e){
   console.log('draw a chess');
   var x = parseInt((e.pageX - cvs.offsetLeft) / GRID_SIZE);
   var y = parseInt((e.pageY - cvs.offsetTop) / GRID_SIZE);
   // only when game start can putchess, otherwise return
   if(checkerBoard[x][y].state){
      return;
   }
   socket.emit('putchess', roomId, x,y);
   console.log(x, y);
 //  document.getElementById('tips').innerText = 'Now ' +( turn ==false? 'Black' : 'White') +' Turn!'
}

/**
 * draw chess
 */
function drawChess(x, y){
   ctx.beginPath();
   ctx.fillStyle = (checkerBoard[x][y].type =='white' ? '#eee':'#000');
   ctx.arc((x + 0.5) * GRID_SIZE, (y + 0.5) * GRID_SIZE, (GRID_SIZE / 2) * 0.9, 0, 2 * Math.PI);
   ctx.fill();
   ctx.closePath();
}

/**
 * draw checkerboard
 */
function drawCheckerBoard(){
   ctx.beginPath();
   ctx.strokeStyle = '#000';
   ctx.fillStyle = '#ffc0cb';
   ctx.fillRect(0, 0, cvs.width, cvs.height)
   for(var i = 0; i < HORIZONTAL_SIZE; i++){
      for(var j = 0; j < VERTICAL_SIZE; j++){
         ctx.strokeRect(i *GRID_SIZE, j * GRID_SIZE, GRID_SIZE, GRID_SIZE)
         if(checkerBoard[i][j].state){
            drawChess(i,j);
         }
      }
   }
   ctx.closePath();
}

socket.on('gameover',function(data){
   document.querySelector('#info').innerHTML = (data == 'black' ? 'Black Win!' : 'White Win!');
   cvs.onclick = null;
   console.log('gameover');
   alert(data == 'black' ? 'Black Win!' : 'White Win!');
});

document.getElementById('restart').onclick = function(){
   if(color !='null'){
      socket.emit('restart',roomId);
   }
}

document.getElementById('join').onclick = function(){
   roomId=document.getElementById("roomId").value;
   console.log(roomId);
   socket.emit('joinRoom',roomId);
   document.getElementById("restart").disabled=false;
   document.getElementById("join").disabled=true;
   document.getElementById("leave").disabled=false;
}

document.getElementById('leave').onclick = function(){
   // console.log(roomId);
   if (confirm("Want to leave this game?")) {
      document.getElementById("restart").disabled=true;
      document.getElementById("join").disabled=false;
      document.getElementById("leave").disabled=true;
      cvs.onclick = null;

      socket.emit('leaveRoom',roomId,color);
      document.querySelector('#info').innerHTML = ('Enter room id to Join a game!');
      document.querySelector('#color').innerHTML = ('You are a visitor.');
//      location.reload();
   } 
}


socket.on('restartRequest',function(){
   if(color !='visitor'){
      // console.log('receive ' +passcolor +' restart request');
      if (confirm("Want to restart?")) {
         socket.emit('restartConfirm',roomId, color);

      } else {
         socket.emit('restartConfirm',RoomId, (color + 'doesn\'t'));
      }
   }
});

socket.on('leaveInfo',function(color){
   console.log(color + ' left the game');
   document.querySelector('#info').innerHTML = ('Wait for another gamer.');
 //  socket.emit('stopInterv');
   alert(color + ' left the game');
   cvs.onclick = null;
//   socket.emit('joinRoom',roomId);
});

socket.on('stocHeartBeat',function(nowtime){
   if(color !='visitor'){
      console.log(color + ' receive heartbeat at' + nowtime);
      socket.emit('ctosHeartBeat', nowtime);
   }
});

