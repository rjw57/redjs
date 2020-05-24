import * as React from 'react';
import {useMouseHovered, useHoverDirty} from 'react-use';
import useComponentSize from '@rehooks/component-size';

import {Screen} from './components';
import {Buffer} from './buffer';
import {Widget} from './widgets';
import {useScreenFont} from './fonts';

import './App.css';

export default () => {
  const fontSpec = useScreenFont();
  const ref = React.useRef<HTMLDivElement>(null);
  const {elX: mouseX, elY: mouseY} = useMouseHovered(ref, {whenHovered: true});
  const {width, height} = useComponentSize(ref);
  const isHovered = useHoverDirty(ref);

  // Compute current mouse line and column
  const mouseLine = Math.floor(mouseY / fontSpec.glyphHeight);
  const mouseColumn = Math.floor(mouseX / fontSpec.glyphWidth);

  // Compute screen size in lines and columns
  const lineCount = Math.floor(height / fontSpec.glyphHeight);
  const columnCount = Math.floor(width / fontSpec.glyphWidth);

  // Determine if pointer is over screen
  const isMouseActive = isHovered && (mouseLine < lineCount) && (mouseColumn < columnCount);

  const [buffer, setBuffer] = React.useState<Buffer | null>(null);

  const requestRedraw = () => {
    if(!buffer) { return; }
    const dirtyRegion = {
      beginLine: 0, endLine: buffer.lineCount, beginColumn: 0, endColumn: buffer.columnCount
    };
    setBuffer(rootWidget.redraw(buffer, dirtyRegion));
  }
  const rootWidget = React.useMemo(() => new Widget({requestRedraw}), []);

  const redraw = (buffer: Buffer) => {
    const top = Buffer.createFilledWithCell(1, Math.max(buffer.columnCount, 20), {
      glyph: ' ',
      foregroundColour: 'black',
      backgroundColour: '#888',
    });
    Array.from('File').forEach((glyph, idx) => {top.lines[0][idx+2].glyph = glyph});
    top.lines[0][2].foregroundColour = '#800';

    const bottom = Buffer.createFilledWithCell(1, buffer.columnCount, {
      glyph: ' ',
      foregroundColour: 'black',
      backgroundColour: '#888',
    });

    return buffer.withBufferAt(0, 0, top).withBufferAt(buffer.lineCount-1, 0, bottom);
  }

  /*
  const randomChange = () => {
    setBuffer(buffer => {
      const lineIdx = Math.floor(Math.random() * buffer.lineCount);
      const colIdx = Math.floor(Math.random() * buffer.columnCount);
      return buffer.withBufferAt(lineIdx, colIdx, Buffer.createFilledWithCell(1, 1, {
        glyph: 'X', foregroundColour: 'yellow', backgroundColour: 'blue',
      }))
    });
    //window.setTimeout(randomChange, 25);
  };
  React.useEffect(() => {randomChange();}, []);
  */

  // Redraw root on resize.
  React.useEffect(() => {
    rootWidget.dispatchEvent({type: 'resize', lineCount, columnCount});
    const buffer = Buffer.createFilledWithCell(lineCount, columnCount, {
      glyph: '\u2591',
      foregroundColour: '#008',
      backgroundColour: '#888',
    });
    const dirtyRegion = {
      beginLine: 0, endLine: buffer.lineCount, beginColumn: 0, endColumn: buffer.columnCount
    };
    setBuffer(rootWidget.redraw(buffer, dirtyRegion));
  }, [columnCount, lineCount]);

  const keyEventHandler: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    const {type, key, shiftKey, ctrlKey, metaKey, altKey} = event;
    if((type !== 'keyup') && (type !== 'keydown')) { return; }
    rootWidget.dispatchEvent({type, key, shiftKey, ctrlKey, metaKey, altKey});
  };

  return (
    <div className="app"
      ref={ref}
      onKeyDown={keyEventHandler}
      onKeyUp={keyEventHandler}
      tabIndex={0}
    >
      <Screen
        className="app-screen"
        buffer={buffer}
        fontSpec={fontSpec}
        showMouse={isMouseActive}
        mouseLine={mouseLine}
        mouseColumn={mouseColumn}
      />
    </div>
  );
};
