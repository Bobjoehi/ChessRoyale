var ws = new WebSocket("wss://chess-royale-prototype.herokuapp.com");
// const port = process.env.PORT || 1984;
// var ws = new WebSocket("wss://localhost:1984");

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
const NO_COLOR = 'e';

const MAX_ELIXIR = 10;


// indicates whether a piece is selected
let selected = null;
let curPieceMoves = [];
// indicates the current player
let playerColor;
let opponentColor;
// the amount of elixir this player currently has
let curElixir = 0;
let gameOver = false;
let board = setBoard();


function move(data){
    console.log("sending my move");
    ws.send(data);
}


ws.addEventListener("open", () =>{
    console.log("connected to server");
})

ws.addEventListener("message", m =>{
    console.log(`recived data: ${m.data}`);
    text = m.data + "";
    if (text === "playing as white"){
        startAsWhite();
    }
    if(text === "playing as black"){
        window.location.replace("index_black.html");
    }
    if(text.includes("opponent move: ")){
        receiveMove(text.substring(15));
    }
})

function startAsWhite(){
    playerColor = WHITE;
    opponentColor = BLACK;
    timer(0);
}

function startAsBlack(){
    playerColor = BLACK;
    opponentColor = WHITE;
    timer(0);
}



// initializes the starting board
function setBoard() {
    let board = [
        createBackRow(BLACK),
        createPawnRow(BLACK),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createEmptyRow(),
        createPawnRow(WHITE),
        createBackRow(WHITE)
    ];
    return board
}

// creates the row containing backline pieces
function createBackRow(pieceColor) {
    let backRow = [
        {color: pieceColor, id: ROOK},
        {color: pieceColor, id: KNIGHT},
        {color: pieceColor, id: BISHOP},
        {color: pieceColor, id: QUEEN},
        {color: pieceColor, id: KING},
        {color: pieceColor, id: BISHOP},
        {color: pieceColor, id: KNIGHT},
        {color: pieceColor, id: ROOK}
    ];
    return backRow
}

// creates a row containing only pawn pieces
function createPawnRow(pieceColor) {
    let pawnRow = [
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true},
        {color: pieceColor, id: PAWN, firstMove: true}
    ];
    return pawnRow
}

// creates a row of empty squares
function createEmptyRow() {
    let emptyRow = [
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
        {color: NO_COLOR, id: EMPTY},
    ];
    return emptyRow
}


// pawn movements
// TODO: en passant not implemented
function pawnMoves(row, col) {
    let piece = board[row][col];
    let validMoves = [];
    var promoted = false;
    if (piece.color === WHITE) {
        // piece is white and moves up, row-1
        if (board[row-1][col].color === NO_COLOR) {
            validMoves.push([row-1, col]);
            // 2 square jump
            if (piece.firstMove && board[row-2][col].color === NO_COLOR) {
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
    } else {
        // piece is black and moves down, row+1
        if (board[row+1][col].color === NO_COLOR) {
            validMoves.push([row+1, col]);
            // 2 square jump
            if (piece.firstMove && board[row+2][col].color === NO_COLOR) {
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
    }
    if (promoted) {
        promotion = document.getElementById (rowcolToCoord(row, col));
        promotion.querySelector('.fill').classList.add (idToClass(piece.id, piece.color))
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
        if (board[row-i][col].color !== NO_COLOR) {break;}
        i += 1;
    }
    // check downward movement
    i = 1;
    while (row+i < 8 && board[row+i][col].color !== piece.color) {
        validMoves.push([row+i, col]);
        if (board[row+i][col].color !== NO_COLOR) {break;}
        i += 1;
    }
    // check leftward movement
    i = 1;
    while (col-i >= 0 && board[row][col-i].color !== piece.color) {
        validMoves.push([row, col-i]);
        if (board[row][col-i].color !== NO_COLOR) {break;}
        i += 1;
    }
    // check rightward movement
    i = 1;
    while (col+i < 8 && board[row][col+i].color !== piece.color) {
        validMoves.push([row, col+i]);
        if (board[row][col+i].color !== NO_COLOR) {break;}
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
            if (board[curRow][curCol].color !== NO_COLOR) {break;}
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
    let colCoord = String.fromCharCode(65 + col);
    let coord = colCoord + rowCoord;
    return coord;
}

// a square has been selected (each td's onclick event)
function squareSelected(row, col) {
    // nothing happens if the game is over
    if (gameOver) {
        return;
    }
    console.log(playerColor);
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
            case PAWN:
                curPieceMoves = pawnMoves(row, col);
                break;
            case ROOK:
                curPieceMoves = rookMoves(row, col);
                break;
            case KNIGHT:
                curPieceMoves = knightMoves(row, col);
                break;
            case BISHOP:
                curPieceMoves = bishopMoves(row, col);
                break;
            case QUEEN:
                curPieceMoves = queenMoves(row, col);
                break;
            case KING:
                curPieceMoves = kingMoves(row, col);
        
        }
        currPieceID = rowcolToCoord(row, col);
        currPiece = document.getElementById(currPieceID);
        currPiece.classList.add("selected");
        currPiece.classList.add("hovered");
        highlightMoves(curPieceMoves);
    }
    // else you cant pick up the piece, do nothing
}

// TODO: highlights all possible moves the selected piece can make on HTML
function highlightMoves(validMoves) {
    console.log(validMoves);
    for (coord of validMoves) {
        let squareID = rowcolToCoord(coord[0], coord[1]);
        let square = document.getElementById(squareID);
        square.classList.add('hovered');
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
            const stillHovering = document.querySelectorAll('.hovered');
	        for (const hovering of stillHovering) {
		        hovering.classList.remove("hovered");
		        hovering.classList.remove("selected");
	        }
    } else {
        // check if the input is a valid move
        console.log(curPieceMoves);
        for (coord of curPieceMoves) {
            if (coord[0] === row && coord[1] === col) {
                // nothing happens if there's not enough inspiration
                const piece = board[selected[0]][selected[1]];
                if (curElixir < pieceCost(piece.id)) {
                    return;
                }
                let startRow = selected[0];
                let startCol = selected[1]
                sendMove(startRow, startCol, row, col);
                // move is valid, move piece
                // wait for server to agree
                ws.onmessage = function(m, tab){
                    if(m.data == "valid move"){
                        // if the target is a king, win the game
                        if (board[row][col].id === 6) {
                            gameOver = true;
                            alert ("GAME OVER");
                        }

                        // Putting piece in new square
                        board[row][col] = piece;
                        let newSquare = document.getElementById(rowcolToCoord(row, col));

                        // Promotion (Auto Queening)
                        if (piece.id === PAWN) {
                            if (piece.color === playerColor && row === 0) {
                                piece.id = QUEEN;
                                newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(QUEEN, piece.color));
                            } else if (piece.color != playerColor && row === 7) {
                                piece.id = QUEEN;
                                newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(QUEEN, piece.color));
                            } else {
                                newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(piece.id, piece.color));
                            }
                        } else {
                            newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(piece.id, piece.color));
                        }

                        //Empty the old square
                        board[startRow][startCol] = {color: "e", id: 0};
                        newEmpty = document.getElementById(rowcolToCoord(startRow, startCol));
                        newEmpty.querySelector('.fill').classList = 'fill';
                        // subtract cost
                        totalCost = pieceCost(piece.id);
                        curElixir -= totalCost;
                        console.log(curElixir);
                        // Update Inspiration progress bar
                        progBar = document.getElementById('inspirationBar');
                        progBar.value -= totalCost;
                        inspAmount = document.getElementById('inspirationAmount')
                        inspAmount.innerHTML = "Inspiration: " + progBar.value;
                        // Send log to console
                        console.log("piece has moved");
                        // no piece is selected, reset info
                        selected = null;
                        curPieceMoves = [];
                        piece.firstMove = false;
                        // change piece pictures and unhighlight all squares
                        const stillHovering = document.querySelectorAll('.hovered');
	                    for (const hovering of stillHovering) {
		                    hovering.classList.remove("hovered");
		                    hovering.classList.remove("selected");
	                    }
                    }
                    return;
                };
        
                return;
            }
        }
    }
    // not a valid move, do nothing
}

// cost of moving each piece
function pieceCost(pieceID) {
    switch (pieceID) {
        case PAWN:
            return 2;
        case ROOK:
            return 3;
        case KNIGHT:
            return 3;
        case BISHOP:
            return 4;
        case QUEEN:
            return 6;
        case KING:
            return 2;
    }
}


// Returns the class name based on the piece
function idToClass(pieceID, color) {
    switch(pieceID) {
            case PAWN:
                if (color == WHITE) {
                    return 'W_Pawn';
                } else {
                    return 'B_Pawn';
                }
                break;
            case ROOK:
                if (color == WHITE) {
                    return 'W_Rook';
                } else {
                    return 'B_Rook';
                }
                break;
            case KNIGHT:
                if (color == WHITE) {
                    return 'W_Knight';
                } else {
                    return 'B_Knight';
                }
                break;
            case BISHOP:
                if (color == WHITE) {
                    return 'W_Bishop';
                } else {
                    return 'B_Bishop';
                }
                break;
            case QUEEN:
                if (color == WHITE) {
                    return 'W_Queen';
                } else {
                    return 'B_Queen';
                }
                break;
            case KING:
                if (color == WHITE) {
                    return 'W_King';
                } else {
                    return 'B_King';
                }
        
        }
}
// Updates the progress bar, once every TIME_IN_MILLISECONDS ms
const TIME_IN_MILLISECONDS = 1000;

function timer(n) {
    progBar = document.getElementById('inspirationBar');

    // +1 over time if < maximum inspiration
    if (progBar.value < MAX_ELIXIR) {
        progBar.value += 1;
        curElixir = progBar.value;
        inspAmount = document.getElementById('inspirationAmount')
        inspAmount.innerHTML = "Inspiration: " + progBar.value;
    // Caps at 10
    } else {
        inspAmount.innerHTML = "Inspiration: 10 (MAX)";
    }
    // Stops counter after game ends, always running otherwise
    if (!gameOver) {
        setTimeout(function() {timer(n + 1);}, TIME_IN_MILLISECONDS);

    }

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
    piece = board[a][b];
    board[x][y] = board[a][b];
    board[a][b] = {color: 'e', id: 0};

    let newSquare = document.getElementById(rowcolToCoord(x, y));

    // Promotion (Auto Queening)
    if (piece.id === PAWN) {
        if (piece.color === WHITE && x === 0) {
            piece.id = QUEEN;
            newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(QUEEN, WHITE));
        } else if (piece.color === BLACK && x === 7) {
            piece.id = QUEEN;
            newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(QUEEN, BLAcK));
        } else {
            newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(piece.id, piece.color));
        }
    } else {
        newSquare.querySelector('.fill').classList = 'fill ' + (idToClass(piece.id, piece.color));
    }

    //Empty the old square
    newEmpty = document.getElementById(rowcolToCoord(a, b));
    newEmpty.querySelector('.fill').classList = 'fill';
    //TODO: make changes to the html page
}

// sends the move made to the server
function sendMove(a, b, x, y) {
    //we need to get from the html page which piece is being picked up
    //and where it is being moved to.
    ws.send(a + ", " + b + ", " + x + ", " + y);
}
