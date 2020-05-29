import {EventEmitter} from 'tsee';

import {Buffer} from '../buffer';
import {Region, Size, SizeHint} from './types';

export type WidgetEventMap = {
  requestredraw: (region: Region) => void;
  resize: (size: Size) => void;
};

export class Widget extends EventEmitter<WidgetEventMap> {
  parent: Widget | null;
  size: Size;

  constructor() {
    super();
    this.parent = null;
    this.size = {lineCount: 0, columnCount: 0};
  }

  add(child: Widget) {
    child.parent = this;
  }

  remove(child: Widget) {
    if(child.parent === this) {
      child.parent = null;
    }
  }

  requestRedraw(region?: Region) {
    this.emit('requestredraw', region || {firstLine: 0, firstColumn: 0, ...this.size});
  }

  setSize(lineCount: number, columnCount: number) {
    if((lineCount === this.size.lineCount) && (columnCount === this.size.columnCount)) {
      return;
    }
    this.size = {lineCount, columnCount};
    this.requestRedraw();
  }

  idealSize(hint: SizeHint = {}) : Size {
    return {...this.size, ...hint};
  }

  minimumSize(hint: SizeHint = {}) : Size {
    return {lineCount: 0, columnCount: 0, ...hint};
  }

  maximumSize(hint: SizeHint = {}) : Size {
    return {lineCount: Infinity, columnCount: Infinity, ...hint};
  }

  redraw(region: Region) : Buffer {
    return Buffer.createFilledWithCell(
      region.lineCount, region.columnCount, {
        glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
      }
    );
  }
};

export default Widget;
