import {Buffer, Cell} from '../buffer';

import {Widget} from './Widget';
import {Region} from './types';

export class FilledWidget extends Widget {
  private cell: Cell;

  constructor(cell?: Cell) {
    super();
    this.cell = {glyph: ' ', foregroundColour: 'white', backgroundColour: 'black', ...cell};
  }

  redraw(region: Region) : Buffer {
    return Buffer.createFilledWithCell(region.lineCount, region.columnCount, this.cell);
  }
};

