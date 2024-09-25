import { Color, Coords, FENChar } from "../models";

export abstract class Piece {
    protected abstract _FENChar: FENChar;
    protected abstract _directions: Coords[];

    constructor(private _color: Color) { }

    // getter properties
    // each piece will have 3 properties: direction, color, and FENChar
    // that will be a representation of the piece (P,K,Q,p,k,q etc.)
    public get FENChar(): FENChar {
        return this._FENChar;
    }

    public get directions(): Coords[] {
        return this._directions;
    }

    public get color(): Color {
        return this._color;
    }
}