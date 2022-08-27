const WebSocket = require("ws");

const wss = new WebSocket.Server({port:1984});
let waitingPlayer;

wss.on("connection", ws =>{
    console.log("new client connected");
    //check if there is a waiting player, and if so connect to that waiting player. 
    //otherwise, become the waiting player
    if (waitingPlayer == null){
        waitingPlayer = ws;
    }else{
        // once a player has joined, the waiting player starts the game as white and
        // the new player starts the games as black
        ws["partner"] = waitingPlayer;
        ws["color"] = "b";
        waitingPlayer["partner"] = ws;
        waitingPlayer["color"] = "w";
        ws["board"] = setBoard();
        ws.partner["board"] = ws.board;
        ws.send("playing as black");
        ws.partner.send("playing as white");
        waitingPlayer = null;
    }
    
    //assume incoming move is in the format a, b, x, y
    //where a b are the starting coordinates of the piece and
    //x y are the ending coordinates.
    ws.on("message", m =>{
        console.log(`recived data: ${m}`);
        text = m + "";
        a = parseInt(text.substring(0, 1));
        b = parseInt(text.substring(3, 4));
        x = parseInt(text.substring(6, 7));
        y = parseInt(text.substring(9, 10));
        if (checkMove(a, b, x, y, ws.color, ws.board)){
            // tell both player that ws has made a valid move
            ws.send(a + ", " + b + ", " + x + ", " + y);
            ws.partner.send(a + ", " + b + ", " + x + ", " + y);
            board[x][y] = board[a][b];
            board[a][b] = {color: 'e', id: 0};
        }
        console.log(typeof(text));
        ws.partner.send(text);
    })

    ws.on("close", () =>{
        console.log("client disconnected");
    })
})

//====================================================
// added functions from script.js to include board in parameters
// to make sure players are making valid moves.
const PAWN = 1;
const ROOK = 2;
const KNIGHT = 3;
const BISHOP = 4;
const QUEEN = 5;
const KING = 6;
const EMPTY = 0;

const WHITE = 'w';
const BLACK = 'b';

function checkMove(startR, startC, endR, endC, color, board){
    let piece = board[startR][startC];
    if (piece.color === color){
        switch (piece.id) {
            case 1:
                curPieceMoves = pawnMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
            case 2:
                curPieceMoves = rookMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
            case 3:
                curPieceMoves = knightMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
            case 4:
                curPieceMoves = bishopMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
            case 5:
                curPieceMoves = queenMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
            case 6:
                curPieceMoves = kingMoves(row, col);
                return curPieceMoves.includes([endR, endC]);
        }
    }
    return false;
}

function pawnMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    if (piece.color === 'w') {
        // piece is white and moves up, row-1
        if (board[row-1][col].color === 'e') {
            validMoves.push([row-1, col]);
            // 2 square jump
            if (piece.firstMove && board[row-2][col].color === 'e') {
                validMoves.push([row-2, col]);
            }
        }
        // checks if any piece can be captured
        if (col !== 0 && board[row-1][col-1].color === 'b') {
            validMoves.push([row-1, col-1]);
        }
        if (col !== 7 && board[row-1][col+1].color === 'b') {
            validMoves.push([row-1, col+1]);
        }
    } else {
        // piece is black and moves down, row+1
        if (board[row+1][col].color === 'e') {
            validMoves.push([row+1, col]);
            // 2 square jump
            if (piece.firstMove && board[row+2][col].color === 'e') {
                validMoves.push([row+2, col]);
            }
        }
        // checks if any piece can be captured
        if (col !== 0 && board[row+1][col-1].color === 'w') {
            validMoves.push([row+1, col-1]);
        }
        if (col !== 7 && board[row+1][col+1].color === 'w') {
            validMoves.push([row+1, col+1]);
        }
    }
    return validMoves;
}

// TODO: rook movements
function rookMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    let i = 1;
    // check upward movement
    while (row-i >= 0 && board[row-i][col].color !== piece.color) {
        validMoves.push([row-i, col]);
        if (board[row-i][col].color !== 'e') {break;}
        i += 1;
    }
    // check downward movement
    i = 1;
    while (row+i < 8 && board[row+i][col].color !== piece.color) {
        validMoves.push([row+i, col]);
        if (board[row+i][col].color !== 'e') {break;}
        i += 1;
    }
    // check leftward movement
    i = 1;
    while (col-i >= 0 && board[row][col-i].color !== piece.color) {
        validMoves.push([row, col-i]);
        if (board[row][col-i].color !== 'e') {break;}
        i += 1;
    }
    // check rightward movement
    i = 1;
    while (col+i < 8 && board[row][col+i].color !== piece.color) {
        validMoves.push([row, col+i]);
        if (board[row][col+i].color !== 'e') {break;}
        i += 1;
    }
    return validMoves;
}

// TODO: knight movements
function knightMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    // all the possible places a knight could go
    let checks = [
        [2, 1],
        [2, -1],
        [-2, 1],
        [-2, -1],
        [1, 2],
        [-1, 2],
        [1, -2],
        [-1, -2]
    ];
    // checks each square a knight could go
    for (dir of checks) {
        let curRow = row + dir[0];
        let curCol = col + dir[1];
        if (0 <= curRow && curRow < 8 && 0 <= curCol && curCol < 8 && board[curRow][curCol].color !== piece.color) {
            validMoves.push([curRow, curCol]);
        }
    }
    return validMoves;
}

// TODO: bishop movements
function bishopMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    let diagonals = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1]
    ];
    // goes through the 4 diagonal directions
    for (dir of diagonals) {
        let curRow = row + dir[0];
        let curCol = col + dir[1];
        while (0 <= curRow && curRow < 8 && 0 <= curCol && curCol < 8 && board[curRow][curCol].color !== piece.color) {
            validMoves.push([curRow, curCol]);
            if (board[curRow][curCol].color !== 'e') {break;}
            curRow += dir[0];
            curCol += dir[1];
        }
    }
    return validMoves;
}

// TODO: queen movements
function queenMoves(row, col, board) {
    let validMoves = rookMoves(row, col).concat(bishopMoves(row, col));
    return validMoves;
}

// TODO: king movements
function kingMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    let directions = [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1]
    ];
    // checks each of the 8 surrounding squares
    for (dir of directions) {
        let curRow = row + dir[0];
        let curCol = col + dir[1];
        if (0 <= curRow && curRow < 8 && 0 <= curCol && curCol < 8 && board[curRow][curCol].color !== piece.color) {
            validMoves.push([curRow, curCol]);
        }
    }
    return validMoves;
}