var server = require('http').createServer();
var io = require('socket.io')(server);
var Gobang = require('./lib/gobang.js');
server.listen(3000, '192.168.123.94');

var gobang = new Gobang();

io.on('connection', function (socket) {
    //heartbeat test times up to 3
    var times = 3;
    //send heartbeat test every 3000ms
    var sendinterval = 3000;
    var toleratedelay = 3000;
    // id of setInterv
    var intvid = 0;
    var roomId = 'lobby';
    var color = 'visitor';

    console.log('one client in lobby');

    socket.on('joinRoom', function (roomid) {
        roomId = roomid;
        console.log('one client join room ' + roomId);
        roomId = roomId;
        socket.join(roomId);
        gobang.join(roomId);
        if (gobang.createPlayer(socket, roomId)) {
            color = socket.player.color;
            intvid = startInterv();
            socket.emit('conn', {
                color: socket.player.color,
                num: gobang.getPlayerNum(roomId),
                hs: gobang.HORIZONTAL_SIZE,
                vs: gobang.VERTICAL_SIZE
            });
            if (gobang.getPlayerNum(roomId) >= 2) {
                console.log('room ' + roomId + ' can start game');
                gobang.initCheckerboard(roomId);
                broadcast(roomId);
            }
        } else {
            color = 'visitor';
            socket.emit('conn', {
                color: 'visitor',
                num: gobang.getPlayerNum(roomId),
                hs: gobang.HORIZONTAL_SIZE,
                vs: gobang.VERTICAL_SIZE
            });
            broadcast(roomId);
        }
        ;
    });

    socket.on('disconnect', function () {

        console.log(color + ' in room ' + roomId + ' disconnect');

        //when player in lobby, disconnect means nothing
        if (color == 'visitor' || roomId == 'lobby') {
            return;
        }
        stopInterv();
        if (gobang.getPlayerNum(roomId) == 2) {
            gobang.leaveGame(roomId, color);
            io.sockets.in(roomId).emit('leaveInfo', color);
        } else {
            console.log('Both players\' client disconnect, delete room');
            gobang.deleteRoom(roomId);
        }
    });

    socket.on('putchess', function (roomId, x, y) {
        console.log('client put a chess');
        x = parseInt(x);
        y = parseInt(y);

        gobang.putChess(roomId, x, y);
        broadcast(roomId);
        if (gobang.checkGameover(roomId, x, y)) {
            io.sockets.in(roomId).emit('gameover', gobang.turn == 'black' ? 'white' : 'black');
        }
    });

    socket.on('restart', function (roomId) {
        console.log(roomId + 'want to restart');
        io.sockets.in(roomId).emit('restartRequest');
    });

    socket.on('restartConfirm', function (roomId, color) {
        console.log(color + ' confirm  restart');
        gobang.restartConfirm(roomId, color);
        if (gobang.checkRestart(roomId)) {
            gobang.initCheckerboard(roomId);
            broadcast(roomId);
        }
    });

    socket.on('leaveRoom', function (roomId, color) {
        console.log(color + ' left room ' + roomId);
        if (color == 'visitor') {
            roomId = 'lobby';
            socket.leave(roomId);
            return;
        }
        stopInterv();
        if (gobang.getPlayerNum(roomId) == 2) {
            gobang.leaveGame(roomId, color);
            socket.leave(roomId);
            //   gobang.deleteRoom(roomId);
            io.sockets.in(roomId).emit('leaveInfo', color);
        } else {
            console.log('Both players\' leave room ' + roomId + ', delete it');
            socket.leave(roomId);
            gobang.deleteRoom(roomId);
        }
    });

    /**
     * stop heartbeat test
     */
    socket.on('stopInterv', function () {
        stopInterv();
    });

    socket.on('ctosHeartBeat', function (sendTime) {
        interv = Date.now() - sendTime;
        if (interv < toleratedelay) {
            times = 3;
        } else {
            times--;
        }
    });

    /**
     * when players in room, start heatbeat test to check if players' client still in game
     */
    function startInterv() {
        if (intvid != null) {
            clearInterval(intvid);
            intvid = null;
        }
        console.log(color + ' in room ' + roomId + ' start interv');
        return setInterval(function () {
            if (times >= 0) {
                var nowtime = Date.now();
                socket.emit('stocHeartBeat', nowtime);
                times--;
            } else {
                if (color == 'visitor') {
                    socket.onClose();
                    return;
                }
                if (gobang.getPlayerNum(roomId) == 2) {
                    gobang.leaveGame(roomId, color);
                    socket.leave(roomId);
                    socket.onClose();
                    io.sockets.in(roomId).emit('leaveInfo', color);
                } else {
                    socket.leave(roomId);
                    gobang.deleteRoom(roomId);
                }
            }
        }, 3000);
    }

    /**
     * if player leave room, stop heartbeat test
     */
    function stopInterv() {
        console.log(color + ' in room ' + roomId + ' stop interv');
        clearInterval(intvid);
    }

});


/**
 * broadcast the checkboard to all players and visitors in specific room
 * @param roomId
 */
function broadcast(roomId) {
    console.log('send checkerBoard to room' + roomId);
    io.sockets.in(roomId).emit('getCheckerBoard', {
        turn: gobang.getTurn(roomId),
        checkerBoard: gobang.rooms[roomId].checkerBoard
    });
}


