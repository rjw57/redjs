import * as React from 'react';
import useComponentSize from '@rehooks/component-size';

import {Buffer} from '../buffer';
import {FontSpec} from '../fonts';

export interface ScreenProps extends React.ComponentProps<'canvas'> {
  buffer?: Buffer | null;
  fontSpec: FontSpec;
  showMouse?: boolean;
  mouseLine?: number;
  mouseColumn?: number;
}

export const Screen = (
  { buffer=null, fontSpec, showMouse=false, mouseLine=0, mouseColumn=0, ...elementProps }: ScreenProps
) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const {width, height} = useComponentSize(ref);
  const {font, glyphWidth, glyphHeight} = fontSpec;
  const lastDrawnBufferRef = React.useRef<Buffer | null>(null);
  const lastDrawnMouseCellRef = React.useRef<{line: number, column: number} | null>(null);

  const lineCount = Math.floor(height / glyphHeight);
  const columnCount = Math.floor(width / glyphWidth);
  const scale = window.devicePixelRatio;

  const invertCell = (ctx: CanvasRenderingContext2D, line: number, column: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = '#fff';
    ctx.fillRect(column*glyphWidth, line*glyphHeight, glyphWidth, glyphHeight);
    ctx.restore();
  }

  const redraw = (redrawAll: boolean = false) => {
    if(!ref.current) { return; }
    const ctx = ref.current.getContext('2d', {alpha: false});
    if(!ctx) { return; }

    const lastDrawnBuffer = lastDrawnBufferRef.current;

    ctx.save();

    ctx.scale(scale, scale);
    ctx.font = font;

    // If the buffer size has changed, always redraw everything.
    redrawAll = (
      redrawAll
      || (!!lastDrawnBuffer && !!buffer && (lastDrawnBuffer.lineCount != buffer.lineCount))
      || (!!lastDrawnBuffer && !!buffer && (lastDrawnBuffer.columnCount != buffer.columnCount))
      || (!!lastDrawnBuffer && !buffer)
    );

    // When redrawing the entire screen, clear it first.
    if(redrawAll) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // If not redrawing the entire screen, re-invert the mouse cell if we drew it.
    if(!redrawAll && lastDrawnMouseCellRef.current) {
      invertCell(ctx, lastDrawnMouseCellRef.current.line, lastDrawnMouseCellRef.current.column);
    }

    buffer && buffer.lines.forEach((line, lineIdx) => {
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

    // Invert mouse cell if it is shown.
    if(showMouse) {
      invertCell(ctx, mouseLine, mouseColumn);
      lastDrawnMouseCellRef.current = {line: mouseLine, column: mouseColumn};
    } else {
      lastDrawnMouseCellRef.current = null;
    }

    ctx.restore();

    lastDrawnBufferRef.current = buffer;
  };

  React.useEffect(() => {redraw(false);}, [mouseLine, mouseColumn, showMouse, buffer]);
  React.useEffect(() => {redraw(true);}, [fontSpec]);
  React.useEffect(() => {
    if(!ref.current) { return; }
    ref.current.width = width * scale;
    ref.current.height = height * scale;
    redraw(true);
  }, [width, height]);

  return <canvas ref={ref} {...elementProps} />;
};

export default Screen;
