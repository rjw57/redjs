import {Buffer} from '../buffer';
import {Region} from './types';

export class Widget {
  parent: Widget | null;
  size: {lineCount: number, columnCount: number};

  constructor(parent: Widget | null) {
    this.parent = parent;
    this.size = {lineCount: 0, columnCount: 0};
  }

  setSize(lineCount: number, columnCount: number) {
    this.size = {lineCount, columnCount};
  }

  render(region: Region) : Buffer {
    return Buffer.createFilledWithCell(
      region.lineCount, region.columnCount, {
        glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
      }
    );
  }
};

export default Widget;
