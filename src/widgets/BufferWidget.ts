import {Buffer} from '../buffer';

import {Widget} from './Widget';
import {Region, Size, SizeHint} from './types';

export class BufferWidget extends Widget {
  private buffer: Buffer;

  constructor(buffer: Buffer) {
    super();
    this.buffer = buffer;
  }

  idealSize(hint: SizeHint = {}) : Size {
    return {lineCount: this.buffer.lineCount, columnCount: this.buffer.columnCount};
  }

  minimumSize(hint: SizeHint = {}) : Size {
    return this.idealSize(hint);
  }

  maximumSize(hint: SizeHint = {}) : Size {
    return this.idealSize(hint);
  }

  redraw(region: Region) : Buffer {
    return this.buffer.slice(
      region.firstLine,
      region.firstColumn,
      region.firstLine + region.lineCount,
      region.firstColumn + region.columnCount
    );
  }
};


