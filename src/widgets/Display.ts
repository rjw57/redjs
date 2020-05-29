import {EventEmitter} from 'tsee';

import {Buffer} from '../buffer';
import {Widget} from './Widget';
import {Region} from './types';

export interface MouseEvent {
  type: 'mousemove' | 'mouseclick' | 'mousedown' | 'mouseup';
  line: number;
  column: number;
};

export interface KeyEvent {
  type: 'keyup' | 'keydown' | 'keypress';
  altKey: boolean;
  ctrlKey: boolean;
  key: string;
  location: number;
  metaKey: boolean;
  repeat: boolean;
  shiftKey: boolean;
};

export interface ResizeEvent {
  type: 'resize';
  lineCount: number;
  columnCount: number;
};

export interface UpdateEvent {
  type: 'update';
  buffer: Buffer;
}

type DisplayEventMap = {
  mousemove: (event: MouseEvent) => void,
  mousedown: (event: MouseEvent) => void,
  mouseup: (event: MouseEvent) => void,
  mouseclick: (event: MouseEvent) => void,
  keyup: (event: KeyEvent) => void;
  keydown: (event: KeyEvent) => void;
  keypress: (event: KeyEvent) => void;
  resize: (event: ResizeEvent) => void;
  update: (event: UpdateEvent) => void;
};

export class Display extends EventEmitter<DisplayEventMap> {
  private buffer: Buffer;
  private rootWidget: Widget | null;
  private rootWidgetRequestRedrawHandler: (region: Region) => void;

  constructor(lineCount=25, columnCount=80) {
    super();

    this.rootWidget = null;
    this.buffer = Buffer.createFilledWithCell(lineCount, columnCount, {
      glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
    });

    this.rootWidgetRequestRedrawHandler = (region: Region) => {
      if(this.rootWidget) {
        this.setBuffer(this.buffer.withBufferAt(
          region.firstLine, region.firstColumn, this.rootWidget.redraw(region)
        ));
      }
    }
  }

  add(widget: Widget) {
    if(this.rootWidget) {
      this.rootWidget.off('requestredraw', this.rootWidgetRequestRedrawHandler);
    }
    this.rootWidget = widget;
    if(this.rootWidget) {
      this.rootWidget.setSize(this.buffer.lineCount, this.buffer.columnCount);
      this.rootWidget.on('requestredraw', this.rootWidgetRequestRedrawHandler);
      this.rootWidget.requestRedraw();
    }
  }

  setBuffer(buffer: Buffer) {
    const didResize = (
      (buffer.lineCount !== this.buffer.lineCount)
      || (buffer.columnCount !== this.buffer.columnCount)
    );
    this.buffer = buffer;
    this.emit('update', {type: 'update', buffer: this.buffer});
    if(didResize) {
      this.emit('resize', {
        type: 'resize', lineCount: this.buffer.lineCount, columnCount: this.buffer.columnCount,
      });
    }
  }

  resize(lineCount: number, columnCount: number) {
    this.setBuffer(Buffer.createFilledWithCell(lineCount, columnCount, {
        glyph: ' ', foregroundColour: 'white', backgroundColour: 'black',
    }));
    if(this.rootWidget) {
      this.rootWidget.setSize(this.buffer.lineCount, this.buffer.columnCount);
    }
  }

  postKeyEvent(event: KeyEvent) {
    this.emit(event.type, event);
  }

  postMouseEvent(event: MouseEvent) {
    this.emit(event.type, event);
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

    return (
      Buffer.createFilledWithCell(buffer.lineCount, buffer.columnCount, {
        glyph: '\u2591',
        foregroundColour: '#008',
        backgroundColour: '#888',
      }).withBufferAt(0, 0, top).withBufferAt(buffer.lineCount-1, 0, bottom)
    );
  }
};
