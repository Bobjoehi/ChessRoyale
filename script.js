var ws = new WebSocket("ws://localhost:1984");

function move(data){
    console.log("sending my move");
    ws.send(data);
    pickUpPiece(6, 0);
    movePiece(5, 0);
}


ws.addEventListener("open", () =>{
    console.log("connected to server");
})

ws.addEventListener("message", m =>{
    console.log(`recived data: ${m.data}`);
    text = m.data + "";
    if (text === "you are player 0"){
        startAsWhite();
    }
    if(text === "you are player 1"){
        startAsBlack();
    }
    if(text.includes("opponent move: ")){
        receiveMove(m.data.substring(15));
    }
})

function startAsWhite(){
    //for html display purposes
}

function startAsBlack(){
    //for html display purposes
}

// Start by making regular chess

const PAWN = 1;
const ROOK = 2;
const KNIGHT = 3;
const BISHOP = 4;
const QUEEN = 5;
const KING = 6;
const EMPTY = 0;

const WHITE = 'w';
const BLACK = 'b';

const MAX_ELIXIR = 10;


// indicates whether a piece is selected
let selected = null;
let curPieceMoves = [];
// indicates the current player
let playerColor = 'w';
let opponentColor = 'b';
// the amount of exilir this player currently has
let curExilir = 0;
let gameOver = false;
let board = setBoard();


// initializes the starting board
function setBoard() {
    let board = [
        createBackRow(opponentColor),
        createPawnRow(opponentColor),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createPawnRow(playerColor),
        createBackRow(playerColor)
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


// pawn movements
// TODO: 2 square jump and en passant not implemented
function pawnMoves(row, col) {
    let piece = board[row][col];
    let validMoves = [];
    if (piece.color === playerColor) {
        // piece is white and moves up, row-1
        if (board[row-1][col].color === 'e') {
            validMoves.push([row-1, col]);
            // 2 square jump
            if (piece.firstMove && board[row-2][col].color === 'e') {
                validMoves.push([row-2, col]);
            }
        }
        // checks if any piece can be captured
        if (col !== 0 && board[row-1][col-1].color === opponentColor) {
            validMoves.push([row-1, col-1]);
        }
        if (col !== 7 && board[row-1][col+1].color === opponentColor) {
            validMoves.push([row-1, col+1]);
        }
        // checks if the pawn is at the final row
        if (row === 0) {
            piece.id = 5;
            // TODO: change the picture of the pawn
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
        if (col !== 0 && board[row+1][col-1].color === playerColor) {
            validMoves.push([row+1, col-1]);
        }
        if (col !== 7 && board[row+1][col+1].color === playerColor) {
            validMoves.push([row+1, col+1]);
        }
        if (row === 7) {
            piece.id = 5;
            // TODO: change the picture of the pawn
        }
    }
    return validMoves;
}

// TODO: rook movements
function rookMoves(row, col) {
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
function knightMoves(row, col) {
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
function bishopMoves(row, col) {
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
function queenMoves(row, col) {
    let validMoves = rookMoves(row, col).concat(bishopMoves(row, col));
    return validMoves;
}

// TODO: king movements
function kingMoves(row, col) {
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

// functions that interact with HTML

// converts row and col to chess board coordinate
// each td's id should be its board coordinate
function rowcolToCoord(row, col) {
    let rowCoord = String(8 - row);
    let colCoord = String.fromCharCode(97 + col);
    let coord = colCoord + rowCoord;
    return coord;
}

// a square has been selected (each td's onclick event)
function squareSelected(row, col) {
    // nothing happens if the game is over
    if (gameOver) {
        return;
    }
    if (!selected) {
        pickUpPiece(row, col);
    } else {
        movePiece(row, col);
    }
}
// selection checks
function pickUpPiece(row, col) {
    let piece = board[row][col];
    if (piece.color === playerColor) {
        selected = [row, col];
        // finds possible moves based on piece type
        switch (piece.id) {
            case 1:
                curPieceMoves = pawnMoves(row, col);
                break;
            case 2:
                curPieceMoves = rookMoves(row, col);
                break;
            case 3:
                curPieceMoves = knightMoves(row, col);
                break;
            case 4:
                curPieceMoves = bishopMoves(row, col);
                break;
            case 5:
                curPieceMoves = queenMoves(row, col);
                break;
            case 6:
                curPieceMoves = kingMoves(row, col);
        // TODO: do something with list of legal moves
        // like highlight all the squares that the piece can move to
        highlightMoves(curPieceMoves);
        }
    }
    // else you cant pick up the piece, do nothing
}

// TODO: highlights all possible moves the selected piece can make on HTML
function highlightMoves(validMoves) {
    for (coord of validMoves) {
        let squareID = rowcolToCoord(coord[0], coord[1]);
        let square = document.getElementById(squareID);
        // idk what now
    }
}

// checks if the selected square is a valid move
// should only be called if a piece is already selected
// TODO: also must make changes to the HTML
function movePiece(row, col) {
    // if input is the same as the selected piece's coords, deselect piece
    if (selected[0] === row && selected[1] === col) {
        selected = null;
        curPieceMoves = [];
    }
    // check if the input is a valid move
    for (coord of curPieceMoves) {
        if (coord[0] === row && coord[1] === col) {
            // move is valid, move piece
            // wait for server to agree
            ws.addEventListener("message", async m =>{
                if(m + "" === "valid move"){
                    let piece = board[selected[0]][selected[1]];
                    board[row][col] = piece;
                    board[selected[0]][selected[1]] = {color: "e", id: 0};
                    // no piece is selected, reset info
                    selected = null;
                    curPieceMoves = [];
                    console.log("piece has moved");
                    // change piece pictures and unhighlight all squares
                }
            })
            return;
        }
    }
    // not a valid move, do nothing
}


// makes the move received from the other player
// move should be a string in the format 'a, b, x, y'
//where a b are the starting coordinates of the piece and
//x y are the ending coordinates.
function receiveMove(move) {
    a = parseInt(move.substring(0, 1));
    b = parseInt(move.substring(3, 4));
    x = parseInt(move.substring(6, 7));
    y = parseInt(move.substring(9, 10));
    board[x][y] = ws.board[a][b];
    board[a][b] = {color: 'e', id: 0};

    //TODO: make changes to the html page
}

// sends the move made to the server
function sendMove() {
    //we need to get from the html page which piece is being picked up
    //and where it is being moved to.
    
}