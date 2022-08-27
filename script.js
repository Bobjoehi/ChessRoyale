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

let board = setBoard();

// indicates whether a piece is selected
let selected = false;
// indicates the current player
let playerColor = 'w';


function setBoard() {
    // this sucks i hate javascript
    let board = [
        createBackRow('b'),
        createPawnRow('b'),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createPawnRow('w'),
        createBackRow('w')
    ]
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
    ]
    return backRow
}

// creates a row containing only pawn pieces
function createPawnRow(pieceColor) {
    let pawnRow = [
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1},
        {color: pieceColor, id: 1}
    ]
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
    ]
    return emptyRow
}


// selection checks
function checkPieceSide(piece) {
    if (piece.color === playerColor) {
        // valid selection
    } else {
        // you cant do that >:(
    }
}

// pawn movements
function pawnMoves(row, col) {
    let piece = board[row][col];
    let validMoves = [];
    if (piece.color === 'w') {
        // piece is white and moves up, row-1
        if (board[row-1][col].color === 'e') {
            validMoves.push([row-1, col]);
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

// rook movements


// knight movements


// bishop movements


// queen movements


// king movements