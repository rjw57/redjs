import React from 'react';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';

import { useScreenFont } from './fonts';
import CanvasDrawBuffer from './CanvasDrawBuffer';

import { CellAttributes } from './types';
import Group from './Group';
import View from './View';
import Rect from './Rect';

class FilledView extends View {
  protected _glyph: string;
  protected _attributes: CellAttributes

  constructor(bounds: Rect, glyph: string, attributes: CellAttributes) {
    super(bounds);
    this._glyph = glyph;
    this._attributes = attributes;
  }

  draw() {
    super.draw();
    const drawBuffer = this.drawBuffer;
    if(!drawBuffer) { return; }
    drawBuffer.fillRect(this.bounds, this._glyph, this._attributes);
  }
}

interface Props {
  className?: string;
};

export default styled(({className}: Props) => {
  const screenGroup = React.useMemo(() => {
    const screenGroup = new Group(new Rect({x: 0, y: 0}, canvasSize))
    screenGroup.setViews([
      new FilledView(
        new Rect({x: 50, y: 0}, {width: 50, height: 20}),
        '\u2591',
        {
          foregroundFillStyle: '#00f',
          backgroundFillStyle: '#888',
        },
      ),
    ]);
    return screenGroup;
  }, []);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const canvasSize = useComponentSize(canvasRef);
  const screenFontSpec = useScreenFont();

  const drawBuffer = React.useMemo(() => {
    if(!canvasRef.current) { return; }
    return new CanvasDrawBuffer(canvasRef.current);
  }, [canvasRef.current]);

  React.useEffect(() => {
    if(!drawBuffer) { return; }
    screenGroup.setDrawBuffer(drawBuffer);
  }, [screenGroup, drawBuffer]);

  // On font change, update draw buffer and redraw.
  React.useEffect(() => {
    if(!drawBuffer) { return; }
    const { font, glyphWidth, glyphHeight } = screenFontSpec;
    drawBuffer.setFont(font, glyphWidth, glyphHeight);
    screenGroup.scheduleDraw();
  }, [screenFontSpec, drawBuffer, screenGroup]);

  // On canvas resize, update width and height and redraw entire canvas.
  React.useEffect(() => {
    if(!canvasRef.current || !drawBuffer) { return; }
    const { width, height } = canvasSize;
    canvasRef.current.width = width * window.devicePixelRatio;
    canvasRef.current.height = height * window.devicePixelRatio;
    drawBuffer.resize(drawBuffer.getCanvasSize());
    screenGroup.scheduleDraw();
  }, [canvasSize, canvasRef, screenGroup]);

  /*
  React.useEffect(() => {
    if(!drawBuffer) { return; }
    setTimeout(() => {
      drawBuffer.putText(120, 3, "hello, world", {
        foregroundFillStyle: 'white', backgroundFillStyle: 'blue'
      });
    }, 1000);
  }, [drawBuffer, canvasSize]);
 */

  return <canvas ref={canvasRef} className={className} />;
})``;
