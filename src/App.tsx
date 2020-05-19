import * as React from 'react'

import {Screen} from './components';
import {Buffer} from './buffer';

import './App.css';

export default () => {
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
    const newBuffer = Buffer.createFilledWithCell(
      lineCount, columnCount,
      {
        glyph: '\u2591',
        foregroundColour: '#00f',
        backgroundColour: '#888',
      },
    );
    setBuffer(redraw(newBuffer));
  };

  return (
    <div className="app">
      <Screen buffer={buffer} onResize={resizeHandler} className="app-screen" />
    </div>
  );
};
