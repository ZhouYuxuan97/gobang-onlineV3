const HORIZONTAL_SIZE = 20;
const VERTICAL_SIZE = 20;

class gobang {
    constructor() {
        this.HORIZONTAL_SIZE = HORIZONTAL_SIZE;
        this.VERTICAL_SIZE = VERTICAL_SIZE;
        this.rooms = []
        // this.players = [];    //playerlist
        // this.checkerBoard= [];
        // this.colorList = ['white', 'black'];
        // this.gaming = false;       //gaming statues
        // this.turn = 'black';
        // this.restart= [];
    }

    /**
     * Initialize the room
     * @param roomId
     */
    join(roomId) {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                players: [],
                checkerBoard: [],
                colorList: ['white', 'black'],
                turn: 'black',
                restart: [],
                gaming: false,
                num: 2
            }
        }
    }

    createPlayer(socket, roomId) {
        let playerCount = this.rooms[roomId].players.length;
        if (playerCount >= 2) return false;
        let player = {
            socket: socket,
            color: this.rooms[roomId].colorList.pop(),
            roomId: roomId
        }

        this.rooms[roomId].players.push(player);
        socket.player = player;

        return true;
    }

    deleteRoom(roomId) {
        delete this.rooms[roomId];
    }

    getPlayerNum(roomId) {
        try {
            return this.rooms[roomId].players.length;
        } catch {
            return 0;
        }

    }

    getTurn(roomId) {
        return this.rooms[roomId].turn;
    }

    getHeartbeat(roomId) {
        return this.rooms[roomId].heartbeat;
    }

    setHeartBeat(roomId, i) {
        this.rooms[roomId].heartbeat += i;
    }

    resetHeartBeat(roomId) {
        this.rooms[roomId].heartbeat += 3;
    }

    /**
     * after both players votes, decide if restart
     * @param roomId
     * @returns {boolean}
     */
    checkRestart(roomId) {
        if (this.rooms[roomId].restart.length == 2) {
            for (var i = 0; i < 2; i++) {
                if (this.rooms[roomId].restart[i] == false) {
                    this.resetResrart(roomId);
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    resetResrart(roomId) {
        this.rooms[roomId].restart = [];
    }

    /**
     * initialize the game and checkerboard in room
     */
    initCheckerboard(roomId) {
        for (var i = 0; i < this.HORIZONTAL_SIZE; i++) {
            this.rooms[roomId].checkerBoard[i] = [];
            for (var j = 0; j < this.VERTICAL_SIZE; j++) {
                this.rooms[roomId].checkerBoard[i][j] = {
                    state: false,    // if a chess on this block
                    type: 'black'    // the color of chess on this block
                };
            }
        }
        this.rooms[roomId].restart = [];
        this.rooms[roomId].gaming = true;
        this.rooms[roomId].heartbeat = 3;
    }

    /**
     * left game, one player leave game -> change room info, 2 players leave game -> delete room
     */
    leaveGame(roomId, color) {
        // if is a visitor, do nothing
        if (color == 'visitor'){
            roomId = 'lobby';
            return;
        }

        for (let i = 0; i < this.rooms[roomId].players.length; i++) {
            if (this.rooms[roomId].players[i].color == color) {
                this.rooms[roomId].colorList.push(color);
                this.rooms[roomId].players.splice(i, 1);
                if (this.rooms[roomId].players.length == 0) {
                    delete rooms[roomId];
                    break;
                }
                this.initCheckerboard(roomId);
                break;
            }
        }
    }


    /**
     * place a chess
     * @param x
     * @param y
     */
    putChess(roomId, x, y) {
        this.rooms[roomId].checkerBoard[x][y].state = true;
        this.rooms[roomId].checkerBoard[x][y].type = this.rooms[roomId].turn;
        this.toggleTurn(roomId);
    }

    /**
     * reverse chess color
     */
    toggleTurn(roomId) {
        this.rooms[roomId].turn = (this.rooms[roomId].turn == 'black' ? 'white' : 'black')
    }

    gameover(roomId, x, y) {
        if (this.checkGameover(roomId, x, y)) {
            return true;
        }
        return false;
    }

    checkGameover(roomId, x, y) {
        if (this.checkAllDirections(roomId, x, y, 1, 1) || this.checkAllDirections(roomId, x, y, 0, 1) || this.checkAllDirections(roomId, x, y, 1, 0) || this.checkAllDirections(roomId, x, y, -1, 1))
            return true;
        else return false;
    }

    checkAllDirections(roomId, x, y, a, b) {
        var type = this.rooms[roomId].checkerBoard[x][y].type
        var tempCheckerBoard = this.rooms[roomId].checkerBoard
        var total = 1
        var tx = x + a
        var ty = y + b
        while (tx >= 0 && tx < this.HORIZONTAL_SIZE && ty >= 0 && ty < this.VERTICAL_SIZE && tempCheckerBoard[tx][ty].type == type && tempCheckerBoard[tx][ty].state == true) {
            total++;
            tx += a;
            ty += b;
        }
        tx = x - a;
        ty = y - b;
        while (tx >= 0 && tx < this.HORIZONTAL_SIZE && ty >= 0 && ty < this.VERTICAL_SIZE && tempCheckerBoard[tx][ty].type == type && tempCheckerBoard[tx][ty].state == true) {
            total++;
            tx -= a;
            ty -= b;
        }
        //       console.log(total);
        if (total == 5)
            return true;
        return false;
    }

    restartConfirm(roomId, color) {
        if (color == 'white' || color == 'black')
            this.rooms[roomId].restart.push(true);
        else {
            this.rooms[roomId].restart.push(false);
        }
    }
}

module.exports = gobang;
