import { Piece } from "./pieces/piece";
import { Rook } from "./pieces/rook";
import { Color } from "./models";
import { Knight } from "./pieces/knight";
import { Bishop } from "./pieces/bishop";
import { King } from "./pieces/kings";
import { Pawn } from "./pieces/pawn";
import { FENChar } from "./models";
import { Queen } from "./pieces/queen";
import { SafeSquares } from "./models";
import { Coords } from "./models";




export class ChessBoard{
    private chessBoard: (Piece|null)[][];
    // hard code the size of the chess board
    private readonly chessBoardSize: number = 8;
    private _playerColor = Color.White;
    private _safeSquares: SafeSquares;

    constructor() {
        // Laying the outline of our chessboard in our 2 dimensional matrix of black and white pieces
        this.chessBoard = [
            [
                new Rook(Color.White), new Knight(Color.White), new Bishop(Color.White), new Queen(Color.White),
                new King(Color.White), new Bishop(Color.White), new Knight(Color.White), new Rook(Color.White)
            ],
            [
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White),
                new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White), new Pawn(Color.White)
            ],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [null, null, null, null, null, null, null, null],
            [
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black),
                new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black), new Pawn(Color.Black)
            ],
            [
                new Rook(Color.Black), new Knight(Color.Black), new Bishop(Color.Black), new Queen(Color.Black),
                new King(Color.Black), new Bishop(Color.Black), new Knight(Color.Black), new Rook(Color.Black)
            ],
        ];
        // constructor for our safe squares of the selected piece 
        this._safeSquares = this.findSafeSquares();
    }


    //------------------------------------- Getters and Setters -------------------------------------
    // getting color of our player for this instance 
    public get playerColor(): Color {
        return this._playerColor;
    }

    // getting the view of the chessboard
    public get chessBoardView(): (FENChar | null)[][] {
        // looping through our chessboard and for each row we are checking if the squares
        // have a piece or are empty 
        return this.chessBoard.map(row => {
            // if there is a piece then we need to return its FEN representation  
            return row.map(piece => piece instanceof Piece ? piece.FENChar : null);
        })
    }

    // only need a getter fn for safe squares of our selected piece  
    public get safeSquares(): SafeSquares {
        return this._safeSquares;
    }


    //------------------------------------ Methods -----------------------------------------
    // logic to determine if square is dark(black)
    // if both x AND y coordinates are even OR if both x AND y coordinates are odd 
    public static isSquareDark(x: number, y: number): boolean {
        return x % 2 === 0 && y % 2 === 0 || x % 2 === 1 && y % 2 === 1;
    }

    // method that checks weather the newly created coordinates are valid 
    private areCoordsValid(x: number, y: number): boolean {
        // for them to be valid x AND y have to be greater then or equal 0 AND x AND y 
        // coordinates have to be smaller then the chessboard size (8)
        return x >= 0 && y >= 0 && x < this.chessBoardSize && y < this.chessBoardSize;
    }

    public isInCheck(playerColor: Color): boolean {
        // see if position is in check by looping through the chessboard 
        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                // checking if each square is empty or has a piece 
                const piece: Piece | null = this.chessBoard[x][y];
                // if piece is empty or the piece color is the same as the player's color continue
                if (!piece || piece.color === playerColor) continue;

                // now traverse through all the the piece's directions
                for (const { x: dx, y: dy } of piece.directions) {
                    // make new x and y coordinates 
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    // if new coordinates are not valid continue 
                    if (!this.areCoordsValid(newX, newY)) continue;

                    // if the piece is pawn, knight , or king its an attack piece 
                    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
                        // just checking if its a pawn and dy is 0 because pawns can only attack diagonally
                        if (piece instanceof Pawn && dy === 0) continue;

                        // attacked piece is assigned new x and y coord
                        const attackedPiece: Piece | null = this.chessBoard[newX][newY];
                        // if piece is a king AND the color is the same as the players color 
                        if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                            return true;
                        }
                    }
                    // if piece are bishops , queens , rooks they can move along multiple squares in one direction 
                    else {
                        // traverse all the possible squares along each direction
                        while (this.areCoordsValid(newX, newY)) {
                            const attackedPiece: Piece | null = this.chessBoard[newX][newY];
                            if (attackedPiece instanceof King && attackedPiece.color === playerColor) {
                                return true;
                            }

                            // stop traversing along this direction because we reached a certain piece
                            // bishops etc. cant move over pieces
                            if (attackedPiece !== null) break;

                            // update new x and new y coord
                            newX += dx;
                            newY += dy;
                        }
                    }
                }
            }
        }

        // if position is not in check
        return false;
    }

    // method that is checking if the position is save after the move 
    private isPositionSafeAfterMove(piece:Piece, prevX: number, prevY: number, newX: number, newY: number): boolean {
        const newPiece: Piece | null = this.chessBoard[newX][newY];
        // we cant put piece on a square that already contains piece of the same square
        if (newPiece && newPiece.color === piece.color) return false;

        // simulate position
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;

        // position is safe if that player is not in check after moving the piece 
        const isPositionSafe: boolean = !this.isInCheck(piece.color);

        // restore position back
        this.chessBoard[prevX][prevY] = piece;
        this.chessBoard[newX][newY] = newPiece;

        return isPositionSafe;
    }


    private findSafeSquares(): SafeSquares {
        const safeSquares: SafeSquares = new Map<string, Coords[]>();

        // using for loop to traverse through the board to find the "safe squares"
        for (let x = 0; x < this.chessBoardSize; x++) {
            for (let y = 0; y < this.chessBoardSize; y++) {
                // defining the piece that is selected
                const piece: Piece | null = this.chessBoard[x][y];

                // if square is empty OR piece color is the same as player's color 
                if (!piece || piece.color !== this._playerColor) continue;

                // initialize our pieceSafeSquares to an empty array
                const pieceSafeSquares: Coords[] = [];

                // look toward all of the pieces direction 
                for (const { x: dx, y: dy } of piece.directions) {
                    let newX: number = x + dx;
                    let newY: number = y + dy;

                    if (!this.areCoordsValid(newX, newY)) continue;

                    // create new instance and check if the new piece has the same color as piece then we cant proceed
                    let newPiece: Piece | null = this.chessBoard[newX][newY];
                    if (newPiece && newPiece.color === piece.color) continue;

                    // append new coordinates if position is safe 
                    if (piece instanceof Pawn || piece instanceof Knight || piece instanceof King) {
                        if (this.isPositionSafeAfterMove(piece, x, y, newX, newY))
                            pieceSafeSquares.push({ x: newX, y: newY });
                    }
                    else {
                        // now check queen etc. hence why we use while loop since we can move along one direction and multiple squares
                        while (this.areCoordsValid(newX, newY)) {
                            newPiece = this.chessBoard[newX][newY];
                            if (newPiece && newPiece.color === piece.color) break;

                            if (this.isPositionSafeAfterMove(piece, x, y, newX, newY))
                                pieceSafeSquares.push({ x: newX, y: newY });

                            if (newPiece !== null) break;

                            // increment new x and y coordinate
                            newX += dx;
                            newY += dy;
                        }
                    }
                }

                // after we trasverse through all the spaces if there if any 'safe squares' add them to 
                // our pieceSafeSquares array
                if (pieceSafeSquares.length)
                    safeSquares.set(x + "," + y, pieceSafeSquares);
            }
        }

        return safeSquares;
    }

    // implementing method for moving pieces 
    public move(prevX: number, prevY: number, newX: number, newY: number): void {
        if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY)) return;
        const piece: Piece | null = this.chessBoard[prevX][prevY];
        // we are checking if piece is an empty square or if the piece is the same color as the player if not exit
        if (!piece || piece.color !== this._playerColor) return;

        // checking weather new x and new y are within those safe square 
        const pieceSafeSquares: Coords[] | undefined = this._safeSquares.get(prevX + "," + prevY);
        if (!pieceSafeSquares || !pieceSafeSquares.find(coords => coords.x === newX && coords.y === newY))
            throw new Error("Square is not safe");

        // if its a pawn, king, or rook set moved to true as it can only move once 
        if ((piece instanceof Pawn || piece instanceof King || piece instanceof Rook) && !piece.hasMoved)
            piece.hasMoved = true;

        // update the board. old square empty, new square with the piece
        this.chessBoard[prevX][prevY] = null;
        this.chessBoard[newX][newY] = piece;
        // updating the color of the player after turn is over
        this._playerColor = this._playerColor === Color.White ? Color.Black : Color.White;
        this._safeSquares = this.findSafeSquares();
    }

}