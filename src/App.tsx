import * as React from 'react';

import {Screen} from './components';
import {Buffer} from './buffer';
import {Widget} from './widgets';

import './App.css';

export default () => {
  const [mousePosition, setMousePosition] = React.useState<{line: number, column: number} | null>(null);

  const [buffer, setBuffer] = React.useState<Buffer>(
    Buffer.createFilledWithCell(
      25, 80,
      {
        glyph: '\u2591',
        foregroundColour: '#00f',
        backgroundColour: '#888',
      },
    )
  );

  const requestRedraw = () => {
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

  const randomChange = () => {
    setBuffer(buffer => {
      const lineIdx = Math.floor(Math.random() * buffer.lineCount);
      const colIdx = Math.floor(Math.random() * buffer.columnCount);
      return buffer.withBufferAt(lineIdx, colIdx, Buffer.createFilledWithCell(1, 1, {
        glyph: 'X', foregroundColour: 'yellow', backgroundColour: 'blue',
      }))
    });
    window.setTimeout(randomChange, 25);
  };
  React.useEffect(() => {randomChange();}, []);

  const resizeHandler: React.ComponentProps<typeof Screen>['onResize'] = (
    {lineCount, columnCount}
  ) => {
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
  };

  const keyEventHandler: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    const {type, key, shiftKey, ctrlKey, metaKey, altKey} = event;
    if((type !== 'keyup') && (type !== 'keydown')) { return; }
    rootWidget.dispatchEvent({type, key, shiftKey, ctrlKey, metaKey, altKey});
  };

  return (
    <div className="app"
      onKeyDown={keyEventHandler}
      onKeyUp={keyEventHandler}
      tabIndex={0}
    >
      <Screen
        className="app-screen"
        buffer={buffer}
        onResize={resizeHandler}
        onMouseCellMove={event => {
          const {line, column} = event;
          setMousePosition({line, column});
          rootWidget.dispatchEvent({type: 'mousemove', line, column});
        }}
        onClick={() => {mousePosition && rootWidget.dispatchEvent({type: 'mouseclick', ...mousePosition});}}
        onMouseDown={() => {mousePosition && rootWidget.dispatchEvent({type: 'mousedown', ...mousePosition});}}
        onMouseUp={() => {mousePosition && rootWidget.dispatchEvent({type: 'mouseup', ...mousePosition});}}
      />
    </div>
  );
};
