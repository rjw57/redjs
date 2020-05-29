export interface Size {
  lineCount: number;
  columnCount: number;
};

export interface SizeHint {
  lineCount?: number;
  columnCount?: number;
};

export interface Region extends Size {
  firstLine: number;
  firstColumn: number;
};
