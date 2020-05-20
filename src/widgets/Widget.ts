import {Event} from '../events';
import {Buffer} from '../buffer';

export interface Region {
  beginLine: number;
  endLine: number;
  beginColumn: number;
  endColumn: number;
};

export interface WidgetOptions {
  requestRedraw: (dirtyRegion?: Region) => void;
};

export class Widget {
  requestRedraw: WidgetOptions['requestRedraw'];

  constructor({requestRedraw}: WidgetOptions) {
    this.requestRedraw = requestRedraw;
  }

  dispatchEvent(event: Event) {
    console.log(event);
  }

  redraw(buffer: Buffer, dirtyRegion: Region) {
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

export default Widget;
