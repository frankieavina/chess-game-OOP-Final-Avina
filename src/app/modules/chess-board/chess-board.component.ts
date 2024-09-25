import { Component } from '@angular/core';
import { ChessBoard } from '../../chess-logic/chess-board';
import { Color, FENChar, pieceImagePaths, Coords, SafeSquares } from '../../chess-logic/models';
import { SelectedSquare } from './models';

@Component({
  selector: 'app-chess-board',
  templateUrl: './chess-board.component.html',
  styleUrl: './chess-board.component.css'
})
export class ChessBoardComponent {
  //<----------------------------------- Public/Private Properties ------------------
  // property for the path of the image instance 
  public pieceImagePaths = pieceImagePaths;
  // instantiate our chessboard class 
  protected chessBoard = new ChessBoard();
  // declare our chessboard view
  public chessBoardView: (FENChar | null)[][] = this.chessBoard.chessBoardView;
  // declare public getter for player color 
  public get playerColor(): Color { return this.chessBoard.playerColor; };
  public get safeSquares():SafeSquares{return this.chessBoard.safeSquares};
  // declare our selected square to be empty since no piece is selected initially
  private selectedSquare: SelectedSquare = { piece: null };
  // represent square that are safe to move to for the selected piece as an array of coord
  private pieceSafeSquares: Coords[] = [];


  //<-------------------------------------- METHODS -----------------------------------------------------------------------
  // declaring our isSquareDark Method to see which square will be dark
  public isSquareDark(x: number, y: number): boolean {
    return ChessBoard.isSquareDark(x, y);
  }

  // if x and y are the same as the selected square for css class and highlight the selected square
  public isSquareSelected(x: number, y: number): boolean {
    if (!this.selectedSquare.piece) return false;
    return this.selectedSquare.x === x && this.selectedSquare.y === y;
  }

  //will be used together with css to pin point which square are the safe squares(TRUE) of the selected piece
  public isSquareSafeForSelectedPiece(x: number, y: number): boolean {
    return this.pieceSafeSquares.some(coords => coords.x === x && coords.y === y);
  }

  //----------------------------called method that selects and moves piece ------------
  public move(x: number, y:number): void{
    this.selectingPiece(x,y);
    this.placingPiece(x,y);
  }
  //-----------------------------------------------------------------------------------

  //method that marks the selected piece and and piece's safe square 
  private selectingPiece(x: number, y: number): void {
    const piece: FENChar | null = this.chessBoardView[x][y];
    // if we select empty space 
    if (!piece) return;
    // checking if we are selecting the wrong piece according to the players color
    if (this.isWrongPieceSelected(piece)) return;

    // fixing bug to fix if the same square is selected. So we check by if selected square is not null AND selected square is x AND selected square is equal to y then
    // return and don't do anything. And before that unmark previous selected safe squares as well(de-highlight safe squares)
    const isSameSquareClicked: boolean = !!this.selectedSquare.piece && this.selectedSquare.x === x && this.selectedSquare.y === y;
    if (isSameSquareClicked) return;

    this.selectedSquare = { piece, x, y };
    // assign the safe squares that correspond to the instance of the piece we selected 
    this.pieceSafeSquares = this.safeSquares.get(x + "," + y) || [];
  }

  //placing the piece in the new square(x,y coord)
  private placingPiece(newX: number, newY: number): void {
    // checking if a piece is selected, 
    if (!this.selectedSquare.piece) return;
    if (!this.isSquareSafeForSelectedPiece(newX, newY)) return;

    // descructuring prevx and prevY from selected square and update piece to its new position in the board. and lastly
    // update chessboard view
    const { x: prevX, y: prevY } = this.selectedSquare;
    this.chessBoard.move(prevX, prevY, newX, newY);
    this.chessBoardView = this.chessBoard.chessBoardView;
    this.unmarkingPreviouslySlectedAndSafeSquares(); 
  }

  // Method that prevents selecting pieces of a player who is not playing or whos turn is not up yet
  // we do this by checking the upper and lowercase letters. Upper is white lowercase is black
  private isWrongPieceSelected(piece: FENChar): boolean {
    const isWhitePieceSelected: boolean = piece === piece.toUpperCase();
    return isWhitePieceSelected && this.playerColor === Color.Black ||
      !isWhitePieceSelected && this.playerColor === Color.White;
  }

  // function that takes care of unmarking the selected squares that we selected prior to moving the piece to a new square
  // we do this my resetting selectedSquare property and its associated "safe squares"
  private unmarkingPreviouslySlectedAndSafeSquares(): void {
    this.selectedSquare = { piece: null };
    this.pieceSafeSquares = [];
  }


}
