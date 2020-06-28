import React from 'react';
import styled from 'styled-components';
import useComponentSize from '@rehooks/component-size';

import { useScreenFont } from './fonts';

import {
  CanvasScreen,
  FilledFrame,
  VBox,
  Rect,
} from './vision';

const screenGroup = new VBox(new Rect({x: 0, y: 0}, {width: 80, height: 25}))
screenGroup.addView(
  new FilledFrame(
    new Rect({x: 50, y: 0}, {width: 50, height: 1}),
    'x', { foregroundFillStyle: '#00f', backgroundFillStyle: '#888' },
  ), { grow: 0.5 }
);
screenGroup.addView(
  new FilledFrame(
    new Rect({x: 50, y: 0}, {width: 50, height: 20}),
    '\u2591', { foregroundFillStyle: '#00f', backgroundFillStyle: '#888' },
  ), { grow: 1 }
);
screenGroup.addView(
  new FilledFrame(
    new Rect({x: 50, y: 0}, {width: 50, height: 1}),
    'x', { foregroundFillStyle: '#00f', backgroundFillStyle: '#888' },
  ), { grow: 0.2 }
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
