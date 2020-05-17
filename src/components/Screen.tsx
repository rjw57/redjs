import * as React from 'react';
import useComponentSize from '@rehooks/component-size'

import './Screen.css';

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

  withBufferAt(line: number, column: number, buffer: Buffer) {
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
}

export interface ScreenProps extends React.ComponentProps<'div'> {
  buffer: Buffer;
  onResize?: (event: {lineCount: number, columnCount: number}) => void;
}

export default ({buffer, onResize, ...elementProps}: ScreenProps) => {
  const font = '16px "PxPlus IBM VGA8"';
  const glyphWidth = 8, glyphHeight = 16;

  const ref = React.useRef<HTMLDivElement>(null);
  const {width, height} = useComponentSize(ref);

  const lineCount = Math.floor(height / glyphHeight);
  const columnCount = Math.floor(width / glyphWidth);

  React.useEffect(() => {
    if(onResize) {
      onResize({lineCount, columnCount});
    }
  }, [lineCount, columnCount]);

  return (
    <div ref={ref} {...elementProps}>
    {
      buffer.lines.map((lineCells, lineIdx) => (
        <div
          key={lineIdx}
          style={{
            font,
            lineHeight: `${glyphHeight}px`,
            height: `${glyphHeight}px`,
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
        {
          lineCells.map(({glyph, foregroundColour, backgroundColour}, cellIdx) => (
            <span
              key={cellIdx}
              style={{
                display: 'inline-block',
                color: foregroundColour,
                backgroundColor: backgroundColour,
                whiteSpace: 'pre',
              }}
            >{
              glyph
            }</span>
          ))
        }
        </div>
      ))
    }
    </div>
  );
};
