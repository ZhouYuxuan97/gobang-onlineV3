var server = require('http').createServer();
var io = require('socket.io')(server);
var Yx = require('./lib/yx.js');
server.listen(3000, '192.168.123.94');

var yx = new Yx();

io.on('connection', function(socket){
    console.log('one client connect');
    if(yx.createPlayer(socket)){

       socket.emit('conn',{
           color: socket.player.color,
           num:yx.getPlayerNum(),
           hs: yx.HORIZONTAL_SIZE,
           vs: yx.VERTICAL_SIZE
       });
       if(yx.getPlayerNum() >= 2){
            yx.init();
            broadcast();
        }
    } else {
        socket.emit('conn',{
            color: 'null',
            num:yx.getPlayerNum(),
            hs: yx.HORIZONTAL_SIZE,
            vs: yx.VERTICAL_SIZE
        });
        broadcast();
    };

    socket.on('disconnect', function(){
        console.log('one client leave');
        yx.leftGame(socket);
    });

    socket.on('putchess',function(x,y){
        console.log('client put a chess');
        x = parseInt(x);
        y = parseInt(y);

        yx.putChess(x,y);
        broadcast();
        if(yx.gameover(x, y)){
            io.sockets.emit('gameover', yx.turn =='black'? 'white':'black');
        }
    });

    socket.on('restart',function(color){
        console.log(color + 'want to restart');
        io.sockets.emit('restartRequest',color);
    })

    socket.on('restartConfirm',function(color){
        console.log(color + 'confirm  restart');
        yx.restartConfirm(color);
        if(yx.getRestartNum() == 2){
            yx.init();
            broadcast();
            yx.resetResrart();
        }
    })
});

function broadcast(){
    io.sockets.emit('getCheckerBoard', {
        turn: yx.turn,
        checkerBoard: yx.checkerBoard
    });
}

function broadcastRestart(){
    io.sockets.emit('restartRequest');
}