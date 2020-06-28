export interface CellAttributes {
  foregroundFillStyle: string;
  backgroundFillStyle: string;
}

export interface Cell {
  glyph: string;
  attributes: CellAttributes;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
