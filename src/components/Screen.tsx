import * as React from 'react';
import useComponentSize from '@rehooks/component-size'

import './Screen.css';

export interface Cell {
  glyph: string;
  foregroundColour: string;
  backgroundColour: string;
}

export type Row = Array<Cell>;

export interface ScreenProps extends React.ComponentProps<'canvas'> {
  rows?: Array<Row>;
  onResize?: (event: {rowCount: number, colCount: number}) => void;
}

interface FontSpec {
  font: string;
  glyphWidth: number;
  glyphHeight: number;
}

export default ({ rows = [], onResize, ...elementProps}: ScreenProps) => {
  const [drawnRows, setDrawnRows] = React.useState<ScreenProps['rows']>([]);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [fontSpec, setFontSpec] = React.useState<FontSpec | null>(null);
  const {width: canvasWidth, height: canvasHeight} = useComponentSize(canvasRef);

  const scale = window.devicePixelRatio;
  const renderCanvas = ({onlyDirty = true} = {}) => {
    if(!canvasRef.current || !fontSpec) { return; }

    const {font, glyphWidth, glyphHeight} = fontSpec;

    const ctx = canvasRef.current.getContext('2d', {alpha: false});
    if(!ctx) { return; }

    ctx.scale(scale, scale);
    ctx.textBaseline = 'bottom';
    ctx.font = font;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    console.log(new Date().toISOString());
    let cnt = 0;
    rows.forEach((row, rowIdx) => {
      const drawnRow = drawnRows && drawnRows[rowIdx];
      row.forEach((cell, cellIdx) => {
        const drawnCell = drawnRow && drawnRow[cellIdx];
        if(!onlyDirty || (drawnCell !== cell)) {
          ctx.fillStyle = cell.backgroundColour;
          ctx.fillRect(cellIdx * glyphWidth, rowIdx * glyphHeight, glyphWidth, glyphHeight);
          ctx.fillStyle = cell.foregroundColour;
          ctx.fillText(cell.glyph, cellIdx * glyphWidth, (rowIdx + 1) * glyphHeight)
          cnt++;
        }
      })
    });
    console.log(new Date().toISOString());
    console.log(cnt);
  };

  React.useEffect(() => {
    const font = '16px "PxPlus IBM VGA8"';

    // TypeScript does not yet have the font loading API types so work around it for the moment.
    (document as any).fonts.load(font).then(() => setFontSpec({
      font,
      glyphHeight: 16,
      glyphWidth: 8,
    }))
  }, [setFontSpec]);

  React.useEffect(() => {
    if(!canvasRef.current || (canvasWidth === null) || (canvasHeight === null) || !fontSpec) {
      return;
    }

    canvasRef.current.width = (canvasWidth || 640) * scale;
    canvasRef.current.height = (canvasHeight || 400) * scale;

    renderCanvas({onlyDirty: false});

    if(onResize) {
      onResize({
        rowCount: Math.floor((canvasHeight || 400) / fontSpec.glyphHeight),
        colCount: Math.floor((canvasWidth || 640) / fontSpec.glyphWidth),
      });
    }
  }, [canvasRef, fontSpec, canvasWidth, canvasHeight]);

  React.useEffect(() => { renderCanvas(); }, [rows, fontSpec]);

  return (
    <canvas ref={canvasRef} {...elementProps} />
  );
};
