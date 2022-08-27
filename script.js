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


// TODO: selection checks
function movePiece(row, col) {
    let piece = board[row][col];
    if (piece.color === playerColor) {
        selected = true;
        // finds possible moves based on piece type
        let moves;
        switch (piece.id) {
            case 1:
                moves = pawnMoves(row, col);
                break;
            case 2:
                moves = rookMoves(row, col);
                break;
            case 3:
                moves = kinghtMoves(row, col);
                break;
            case 4:
                moves = bishopMoves(row, col);
                break;
            case 5:
                moves = queenMoves(row, col);
                break;
            case 6:
                moves = kingMoves(row, col);
        // do something with list of legal moves
        }
    } else {
        // you cant do that >:(
    }
}

// pawn movements
// TODO: 2 square jump and en passant not implemented
function pawnMoves(row, col) {
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
// untested
function kinghtMoves(row, col) {
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
// untested
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