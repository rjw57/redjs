import * as React from 'react';
import useComponentSize from '@rehooks/component-size';

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

export interface ScreenProps extends React.ComponentProps<'canvas'> {
  buffer: Buffer;
  onResize?: (event: {lineCount: number, columnCount: number}) => void;
}

interface FontSpec {
  font: string;
  glyphWidth: number;
  glyphHeight: number;
}

const useFont = () => {
  const [fontSpec, setFontSpec] = React.useState<FontSpec>({
    font: '16px monospace', glyphWidth: 8, glyphHeight: 16,
  });

  React.useEffect(() => {
    new FontFace(
      'PxPlus IBM VGA9',
      'url("/fonts/PxPlus%20(TrueType%20-%20extended%20charset)/PxPlus_IBM_VGA9.ttf") format("truetype")'
    ).load().then(fontFace => {
      document.fonts.add(fontFace);
      setFontSpec({font: `16px "${fontFace.family}"`, glyphWidth: 9, glyphHeight: 16});
    });
  }, [setFontSpec]);

  return fontSpec;
};

export default ({buffer, onResize, ...elementProps}: ScreenProps) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const {width, height} = useComponentSize(ref);
  const {font, glyphWidth, glyphHeight} = useFont();
  const lastDrawnBufferRef = React.useRef<Buffer | null>(null);

  const lineCount = Math.floor(height / glyphHeight);
  const columnCount = Math.floor(width / glyphWidth);
  const scale = window.devicePixelRatio;

  const redraw = (redrawAll: boolean) => {
    if(!ref.current) { return; }
    const ctx = ref.current.getContext('2d', {alpha: false});
    if(!ctx) { return; }

    ctx.save();

    ctx.scale(scale, scale);
    ctx.font = font;

    buffer.lines.forEach((line, lineIdx) => {
      const lastDrawnLine = lastDrawnBufferRef.current && lastDrawnBufferRef.current.lines[lineIdx];
      const topY = lineIdx * glyphHeight;
      if(redrawAll || (lastDrawnLine !== line)) {
        line.forEach((cell, cellIdx) => {
          const lastDrawnCell = lastDrawnLine && lastDrawnLine[cellIdx];
          if(redrawAll || (lastDrawnCell !== cell)) {
            const leftX = cellIdx * glyphWidth;
            ctx.fillStyle = cell.backgroundColour;
            ctx.fillRect(leftX, topY, glyphWidth, glyphHeight);
            ctx.fillStyle = cell.foregroundColour;
            ctx.textBaseline = 'bottom';
            ctx.fillText(cell.glyph, leftX, topY + glyphHeight);
          }
        });
      }
    });

    ctx.restore();

    lastDrawnBufferRef.current = buffer;
  };

  React.useEffect(() => {
    onResize && onResize({lineCount, columnCount});
  }, [lineCount, columnCount]);

  React.useEffect(() => {
    if(!ref.current) { return; }
    ref.current.width = width * scale;
    ref.current.height = height * scale;
    redraw(true);
  }, [width, height]);
  React.useEffect(() => {console.log(font); redraw(true);}, [font]);
  React.useEffect(() => {redraw(false);}, [buffer]);

  return <canvas ref={ref} {...elementProps} />;
};
