import * as React from 'react';
import useComponentSize from '@rehooks/component-size';

import {Buffer} from '../buffer';

import fontUrl from '../fonts/PxPlus (TrueType - extended charset)/PxPlus_IBM_VGA8.ttf';

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
    new FontFace('Screen', `url(${fontUrl})`).load().then(fontFace => {
      document.fonts.add(fontFace);
      setFontSpec({font: `16px "${fontFace.family}"`, glyphWidth: 9, glyphHeight: 16});
    });
  }, [setFontSpec]);

  return fontSpec;
};

export const Screen = ({buffer, onResize, ...elementProps}: ScreenProps) => {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const {width, height} = useComponentSize(ref);
  const {font, glyphWidth, glyphHeight} = useFont();
  const lastDrawnBufferRef = React.useRef<Buffer | null>(null);

  const lineCount = Math.floor(height / glyphHeight);
  const columnCount = Math.floor(width / glyphWidth);
  const scale = window.devicePixelRatio;

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
  React.useEffect(() => {redraw(true);}, [font]);
  React.useEffect(() => {redraw(false);}, [buffer]);

  return <canvas ref={ref} {...elementProps} />;
};

export default Screen;
