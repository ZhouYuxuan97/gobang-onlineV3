const HORIZONTAL_SIZE =10;
const VERTICAL_SIZE = 10;

class yx{
    constructor() {
        this.HORIZONTAL_SIZE = HORIZONTAL_SIZE;
        this.VERTICAL_SIZE = VERTICAL_SIZE;

        this.players = [];    //playerlist
        this.checkerBoard= [];
        this.colorList = ['white', 'black'];
        this.gaming = false;       //gaming statues
        this.turn = 'black';
        this.restart= [];
    }

    createPlayer(socket){
        let playerCount = this.players.length;
        if(playerCount >=2) return false;
        let player = {
            socket: socket,
            color:this.colorList.pop()
        }

        this.players.push(player);
        socket.player = player;

        return true;
    }

    getPlayerNum(){
        return this.players.length;
    }

    getRestartNum(){
        return this.restart.length;
    }

    resetResrart(){
        this.restart = [];
    }

    /**
     * initialize
     */
    init(){
        for(var i = 0; i < this.HORIZONTAL_SIZE; i++){
            this.checkerBoard[i] = [];
            for(var j = 0; j < this.VERTICAL_SIZE; j++){
                this.checkerBoard[i][j] = {
                    state: false,
                    type: 'black'
                };
            }
        }
        this.gaming = true;
    }

    /**
     * left game
     */
    leftGame(socket){
        if(!socket.player) return;
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].color == socket.player.color){
                this.colorList.push(this.players[i].color);
                this.players.splice(i,1);
                break;
            }
        }
    }


    /**
     * place a chess
     * @param x
     * @param y
     */
    putChess(x,y){
        this.checkerBoard[x][y].state = true;
        this.checkerBoard[x][y].type = this.turn;
        this.toggleTurn();
    }

    /**
     * reverse chess color
     */
    toggleTurn(){
        this.turn = (this.turn =='black'? 'white':'black')
    }

    gameover(x, y){
        if(this.checkGameover(x, y)){
        //    var chess = (whiteTurn == true? 'Black' : 'White')
        //    document.getElementById('tips').innerText = chess + ' Win!'
            return true;
        }
        return false;
    }

    checkGameover(x, y){
        if(this.checkAllDirections(x, y, 1, 1)||this.checkAllDirections(x, y, 0, 1)||this.checkAllDirections(x, y, 1, 0)|| this.checkAllDirections(x, y, -1, 1))
        return true;
        else return false;
    }

    checkAllDirections(x, y, a, b){
        var type = this.checkerBoard[x][y].type
        var total = 1
        var tx = x + a
        var ty = y + b
        while(tx >= 0 && tx < this.HORIZONTAL_SIZE && ty >= 0 && ty < this.VERTICAL_SIZE && this.checkerBoard[tx][ty].type == type && this.checkerBoard[tx][ty].state == true){
            total++;
            tx += a;
            ty += b;
        }
        tx = x - a;
        ty = y - b;
        while(tx >= 0 && tx < this.HORIZONTAL_SIZE && ty >= 0 && ty < this.VERTICAL_SIZE && this.checkerBoard[tx][ty].type == type && this.checkerBoard[tx][ty].state == true){
            total++;
            tx -= a;
            ty -= b;
        }
        console.log(total);
        if(total == 5)
            return true;
        return false;
    }

    restartConfirm(color){
        if(color == 'white'||color == 'black')
            this.restart.push(color);
    }
}

module.exports = yx;