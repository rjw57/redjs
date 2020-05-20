import * as React from 'react';
import useComponentSize from '@rehooks/component-size';
import {useMouseHovered} from 'react-use';

import {Buffer} from '../buffer';
import {useScreenFont} from '../fonts';

export interface ScreenProps extends React.ComponentProps<'canvas'> {
  buffer: Buffer;
  onResize?: (event: {lineCount: number, columnCount: number}) => void;
  onMouseCellMove?: (event: {line: number, column: number}) => void;
  onMouseCellClick?: (event: {line: number, column: number}) => void;
}

export const Screen = (
  {buffer, onResize, onMouseCellMove, onMouseCellClick, ...elementProps}: ScreenProps
) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const {elX: mouseX, elY: mouseY} = useMouseHovered(ref, {whenHovered: true});

  const {width, height} = useComponentSize(ref);
  const {font, glyphWidth, glyphHeight} = useScreenFont();
  const lastDrawnBufferRef = React.useRef<Buffer | null>(null);
  const lastDrawnMouseCell = React.useRef<{line: number, column: number} | null>(null);

  const lineCount = Math.floor(height / glyphHeight);
  const columnCount = Math.floor(width / glyphWidth);
  const scale = window.devicePixelRatio;
  const mouseLine = Math.min(lineCount-1, Math.floor(mouseY / glyphHeight));
  const mouseColumn = Math.min(columnCount-1, Math.floor(mouseX / glyphWidth));

  const invertCell = (ctx: CanvasRenderingContext2D, line: number, column: number) => {
    ctx.save();
    ctx.globalCompositeOperation = 'difference';
    ctx.fillStyle = '#fff';
    ctx.fillRect(column*glyphWidth, line*glyphHeight, glyphWidth, glyphHeight);
    ctx.restore();
  }

  const redraw = (redrawAll: boolean = false) => {
    const lastDrawnBuffer = lastDrawnBufferRef.current;

    if(!ref.current) { return; }
    const ctx = ref.current.getContext('2d', {alpha: false});
    if(!ctx) { return; }

    ctx.save();

    ctx.scale(scale, scale);
    ctx.font = font;

    // If the buffer size has changed, always redraw everything.
    redrawAll = (
      redrawAll
      || (!!lastDrawnBuffer && (lastDrawnBuffer.lineCount != buffer.lineCount))
      || (!!lastDrawnBuffer && (lastDrawnBuffer.columnCount != buffer.columnCount))
    );

    // When redrawing the entire screen, clear it first.
    if(redrawAll) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    // If not redrawing the entire screen, re-invert the mouse cell if we drew it.
    if(!redrawAll && lastDrawnMouseCell.current) {
      invertCell(ctx, lastDrawnMouseCell.current.line, lastDrawnMouseCell.current.column);
    }

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

    // Invert mouse cell
    invertCell(ctx, mouseLine, mouseColumn);
    lastDrawnMouseCell.current = {line: mouseLine, column: mouseColumn};

    ctx.restore();

    lastDrawnBufferRef.current = buffer;
  };

  React.useEffect(() => {
    onMouseCellMove && onMouseCellMove({line: mouseLine, column: mouseColumn});
    redraw(false);
  }, [mouseLine, mouseColumn]);

  React.useEffect(() => {
    onResize && onResize({lineCount, columnCount});
  }, [lineCount, columnCount]);

  React.useEffect(() => {
    if(!ref.current) { return; }
    ref.current.width = width * scale;
    ref.current.height = height * scale;
    redraw(true);
  }, [width, height]);
  React.useEffect(() => {redraw(true);}, [font]);
  React.useEffect(() => {redraw(false);}, [buffer]);

  return <canvas ref={ref} {...elementProps} />;
};

export default Screen;
