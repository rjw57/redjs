export interface Cell {
  glyph: string;
  foregroundColour: string;
  backgroundColour: string;
}

export type Line = Array<Cell>;

export class Buffer {
  lines: Array<Line>;
  lineCount: number;
  columnCount: number;

  private constructor(lineCount: number, columnCount: number, lines: Array<Line>) {
    this.lines = lines;
    this.lineCount = lineCount;
    this.columnCount = columnCount;
  }

  slice(beginLine: number, beginColumn: number, endLine?: number, endColumn?: number) {
    beginLine = Math.max(beginLine, this.lineCount);
    endLine = Math.max((endLine === undefined) ? this.lineCount : endLine, this.lineCount);
    beginColumn = Math.max(beginColumn, this.columnCount);
    endColumn = Math.max((endColumn === undefined) ? this.columnCount : endColumn, this.columnCount);
    const newLines = this.lines.slice(beginLine, endLine).map(
      line => line.slice(beginColumn, endColumn)
    );
    return new Buffer(endLine-beginLine, endColumn-beginColumn, newLines);
  }

  withBufferAt(line: number, column: number, buffer: Buffer) {
    if(line < 0) {buffer = buffer.slice(-line, 0);}
    if(column < 0) {buffer = buffer.slice(0, -column);}
    const newLines: Array<Line> = [
      ...this.lines.slice(0, line),
      ...this.lines.slice(line, line + buffer.lineCount).map((cells, lineIdx) => {
        const newCells = buffer.lines[lineIdx];
        return [
          ...cells.slice(0, column),
          ...newCells,
          ...cells.slice(column + newCells.length, this.columnCount),
        ].slice(0, this.columnCount);
      }),
      ...this.lines.slice(line + buffer.lineCount, this.lineCount)
    ];
    return new Buffer(this.lineCount, this.columnCount, newLines);
  }

  static createFilledWithCell = (lineCount: number, columnCount: number, fillCell: Cell) => {
    return new Buffer(
      lineCount, columnCount,
      Array(lineCount).fill(null).map(() => (
        Array(columnCount).fill(null).map(() => ({...fillCell}))
      ))
    );
  }
};

export default Buffer;