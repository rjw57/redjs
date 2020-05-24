import {Buffer} from '../buffer';

export class Display {
  buffer: Buffer;

  constructor(initialLineCount=25, initialColumnCount=80) {
    this.buffer = Buffer.createFilledWithCell(initialLineCount, initialColumnCount, {
      glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
    });
  }

  resize(newLineCount: number, newColumnCount: number) {
    this.buffer = this.redrawBuffer(
      Buffer.createFilledWithCell(newLineCount, newLineCount, {
        glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
      })
    );
  }

  private redrawBuffer(buffer: Buffer) {
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
};
