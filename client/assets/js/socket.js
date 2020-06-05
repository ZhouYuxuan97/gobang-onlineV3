var socket =io('ws://192.168.123.94:3000');
var color = '';
var GRID_SIZE = 40;
var HORIZONTAL_SIZE = null;
var VERTICAL_SIZE = null;
var checkerBoard = [];
var turn = '';

var cvs = document.getElementById('cvs');
var ctx = cvs.getContext('2d');

socket.on('conn', function(data){
   console.log(data);
   color = data.color;
   document.querySelector('#color').innerHTML = 'You are ' + color;

   HORIZONTAL_SIZE = data.hs;
   VERTICAL_SIZE = data.vs;

   cvs.width = HORIZONTAL_SIZE * GRID_SIZE;
   cvs.height = VERTICAL_SIZE * GRID_SIZE;

   if(data.num == 2){
      init();
   }
});

socket.on('getCheckerBoard', function(data){
   console.log(data);
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
   if(color =='null'){
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

   if(checkerBoard[x][y].state){
      return;
   }
  // drawChess(x, y);
   socket.emit('putchess', x,y);
   console.log(x, y);
 //  document.getElementById('tips').innerText = 'Now ' +( turn ==false? 'Black' : 'White') +' Turn!'
}

/**
 * darw chess
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
      socket.emit('restart',color);
   }
}

socket.on('restartRequest',function(passcolor){
   if(color !='null'){
      console.log('receive ' +passcolor +' restart request');
      if (confirm("Want to restart?")) {
         socket.emit('restartConfirm',color);
      } else {
         socket.emit('restartConfirm',color + 'doesn\'t');
      }
   }
});

