import React from 'react';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';

import { useScreenFont } from './fonts';

import {
  CanvasScreen,
  Frame,
  HBox,
  Rect,
  VBox,
  View,
} from './vision';

const initRect = new Rect({x: 0, y: 0}, {width: 1, height: 1});
const screenGroup =
  new VBox(initRect)
  .addView(
    new View(initRect)
    .setMinimumSize({ width: 0, height: 3 })
    .setBackground('x', {foregroundFillStyle: '#00f', backgroundFillStyle: '#888'})
  )
  .addView(
    new Frame(initRect)
    .addView(
      new HBox(initRect)
      .addView(
        new View(initRect)
        .setBackground('?', {foregroundFillStyle: '#ff0', backgroundFillStyle: '#00f'})
        , {grow: 1}
      )
      .addView(
        new View(initRect)
        .setBackground('\u2591', {foregroundFillStyle: '#00f', backgroundFillStyle: '#888'})
        , {grow: 2}
      )
      .addView(
        new View(initRect)
        .setBackground('/', {foregroundFillStyle: '#ff0', backgroundFillStyle: '#00f'})
        , {grow: 3}
      )
    )
    .setFrameAttributes({foregroundFillStyle: '#fff', backgroundFillStyle: '#00f'})
    .setStyle('double')
    , {grow: 1}
  )
  .addView(
    new View(initRect)
    .setMinimumSize({ width: 0, height: 1 })
    .setBackground('x', {foregroundFillStyle: '#00f', backgroundFillStyle: '#888'})
  );

interface Props {
  className?: string;
};

export default styled(({className}: Props) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const screenFontSpec = useScreenFont();

  const canvasScreen = React.useMemo(() => {
    if(!canvasRef.current) { return null; }
    return new CanvasScreen(canvasRef.current, screenGroup);
  }, [canvasRef.current]);

  // On font change, update screen font.
  React.useEffect(() => {
    if(!canvasScreen) { return; }
    const { font, glyphWidth, glyphHeight } = screenFontSpec;
    canvasScreen.setFont(font, glyphWidth, glyphHeight);
  }, [screenFontSpec, canvasScreen]);

  return <canvas ref={canvasRef} className={className} />;
})``;
