import * as React from 'react';
import useComponentSize from '@rehooks/component-size'

import './Screen.css';

export interface Cell {
  glyph: string;
  foregroundColour: string;
  backgroundColour: string;
}

export type Row = Array<Cell>;

export interface ScreenProps {
  rows?: Array<Row>;
  rowCount: number;
  colCount: number;
}

export default ({ rows = [], rowCount = 25, colCount = 80}: ScreenProps) => {
  const scale = window.devicePixelRatio;
  const glyphWidth = 8, glyphHeight = 16;
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if(canvasRef.current === null) { return; }
    const ctx = canvasRef.current.getContext('2d');
    if(ctx === null) { return; }

    const font = `${glyphHeight}px "PxPlus IBM VGA8"`;

    // TypeScript does not yet have the font loading API types so work around it
    // for the moment.
    (document as any).fonts.load(font).then(() => {
      ctx.scale(scale, scale);
      ctx.textBaseline = 'bottom';
      ctx.font = font
      rows.map((row, rowIdx) => {
        row.map((cell, cellIdx) => {
          ctx.fillStyle = cell.backgroundColour;
          ctx.fillRect(cellIdx * glyphWidth, rowIdx * glyphHeight, glyphWidth, glyphHeight);
          ctx.fillStyle = cell.foregroundColour;
          ctx.fillText(cell.glyph, cellIdx * glyphWidth, (rowIdx + 1) * glyphHeight)
        })
      });
    });
  }, [canvasRef, rows, rowCount, colCount]);

  return (
    <div className="screen">
      <canvas
        ref={canvasRef}
        width={colCount * glyphWidth * scale}
        height={rowCount * glyphHeight * scale}
        style={{
          width: `${colCount * glyphWidth}px`,
          height: `${rowCount * glyphHeight}px`,
        }}
      />
    </div>
  );
};
