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

export interface PackOptions {
  // If present, remaining space in group will be apportioned between views in proportion to this
  // value.
  grow?: number;
}
