const WebSocket = require("ws");
const port = process.env.PORT || 1984;

const wss = new WebSocket.Server({port:port});
let waitingPlayer;
let currWhitePlayer;

const express = require("express");
const app = express();

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.listen(port);


wss.on("connection", ws =>{
    console.log("new client connected");
    //check if there is a waiting player, and if so connect to that waiting player. 
    //otherwise, become the waiting player
    if (waitingPlayer == null){
        waitingPlayer = ws;
    }else if (currWhitePlayer == null){
        // once a player has joined, the waiting player starts the game as white and
        // the new player starts the games as black
        currWhitePlayer = waitingPlayer;
        ws.send("playing as black");
    }else{
        ws["partner"] = waitingPlayer;
        ws["color"] = BLACK;
        waitingPlayer["partner"] = ws;
        waitingPlayer["color"] = WHITE;
        ws["board"] = setBoard();
        ws.partner["board"] = ws.board;
        ws.partner.send("playing as white");
        waitingPlayer = null;
        currWhitePlayer = null;
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
        piece = ws.board[a][b];
        if (checkMove(a, b, x, y, ws.color, ws.board)){
            if(piece.id === PAWN){
                if(piece.color == BLACK && x == 7 || piece.color == WHITE && x == 0){
                    piece.id = QUEEN;
                }
            }
            ws.board[x][y] = ws.board[a][b];
            ws.board[a][b] = {color: 'e', id: 0};
            // logBoardState(ws.board);
            // tell both player that ws has made a valid move
            console.log("validated move");
            ws.send("valid move");
            ws.partner.send("opponent move: " + a + ", " + b + ", " + x + ", " + y);
        }else{
            ws.send("invalid move");
        }
    })

    ws.on("close", () =>{
        console.log("client disconnected");
    })
})

function logBoardState(board){
    for(i = 0; i < 8; i ++){
        console.log(board[i]);
    }
}

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
const NO_COLOR = 'e';

function checkMove(startR, startC, endR, endC, color, board){
    let piece = board[startR][startC];
    if (piece.color === color){
        switch (piece.id) {
            case 1:
                curPieceMoves = pawnMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
            case 2:
                curPieceMoves = rookMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
            case 3:
                curPieceMoves = knightMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
            case 4:
                curPieceMoves = bishopMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
            case 5:
                curPieceMoves = queenMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
            case 6:
                curPieceMoves = kingMoves(startR, startC, board);
                return includesMove(curPieceMoves, [endR, endC]);
        }
    }
    return false;
}

function includesMove(pieceMoves, attemptMove){
    for (const element of pieceMoves) {
        if(element[0] == attemptMove[0] && element[1] == attemptMove[1]){
            return true;
        }
    }
    return false;
}

function pawnMoves(row, col, board) {
    let piece = board[row][col];
    let validMoves = [];
    var promoted = false;
    if (piece.color === WHITE) {
        // piece is white and moves up, row-1
        if (board[row-1][col] !== undefined && board[row-1][col].color === NO_COLOR) {
            validMoves.push([row-1, col]);
            // 2 square jump
            if (piece.firstMove && board[row-2][col].color === NO_COLOR) {
                validMoves.push([row-2, col]);
            }
        }
        // checks if any piece can be captured
        if (col !== 0 && board[row-1][col-1].color === BLACK) {
            validMoves.push([row-1, col-1]);
        }
        if (col !== 7 && board[row-1][col+1].color === BLACK) {
            validMoves.push([row-1, col+1]);
        }
    } else {
        // piece is black and moves down, row+1
        if (board[row+1][col] !== undefined && board[row+1][col].color === NO_COLOR) {
            validMoves.push([row+1, col]);
            // 2 square jump
            if (piece.firstMove && board[row+2][col].color === NO_COLOR) {
                validMoves.push([row+2, col]);
            }
        }
        // checks if any piece can be captured
        if (col !== 0 && board[row+1][col-1].color === WHITE) {
            validMoves.push([row+1, col-1]);
        }
        if (col !== 7 && board[row+1][col+1].color === WHITE) {
            validMoves.push([row+1, col+1]);
        }
    }
    if (promoted) {
        promotion = document.getElementById (rowcolToCoord(row, col));
        promotion.querySelector('.fill').classList.add (idToClass(piece.id, piece.color))
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
    let validMoves = rookMoves(row, col, board).concat(bishopMoves(row, col, board));
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

// initializes the starting board
function setBoard() {
    let board = [
        createBackRow('b'),
        createPawnRow('b'),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createPawnRow('w'),
        createBackRow('w')
    ];
    return board
}

// creates the row containing backline pieces
function createBackRow(pieceColor) {
    let backRow = [
        {color: pieceColor, id: 2},
        {color: pieceColor, id: 3},
        {color: pieceColor, id: 4},
        {color: pieceColor, id: 5},
        {color: pieceColor, id: 6},
        {color: pieceColor, id: 4},
        {color: pieceColor, id: 3},
        {color: pieceColor, id: 2}
    ];
    return backRow
}

// creates a row containing only pawn pieces
function createPawnRow(pieceColor) {
    let pawnRow = [
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true},
        {color: pieceColor, id: 1, firstMove: true}
    ];
    return pawnRow
}

// creates a row of empty squares
function createEmptyRow() {
    let emptyRow = [
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
        {color: 'e', id: 0},
    ];
    return emptyRow
}