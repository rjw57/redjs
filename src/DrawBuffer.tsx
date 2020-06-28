import { Size, Cell, CellAttributes, Point } from './types';
import Rect from './Rect';

type AttributesParam = CellAttributes | ((existing: CellAttributes) => CellAttributes);

const applyAttributes = (cell: Cell, attributes: AttributesParam) => {
  if(attributes instanceof Function) {
    cell.attributes = attributes(cell.attributes);
  } else {
    cell.attributes = attributes;
  }
};

interface State {
  clipRect: Rect;
};

export default class DrawBuffer {
  protected _dirtyRect: Rect;
  protected _size: Size;
  protected _clipRect: Rect;
  protected _cells: Cell[];
  protected _stateStack: State[];

  constructor() {
    this._dirtyRect = new Rect({x: 0, y: 0}, {width: 0, height: 0});
    this._clipRect = new Rect({x: 0, y: 0}, {width: 0, height: 0});
    this._size = {width: 0, height: 0};
    this._cells = [];
    this._stateStack = [];
  }

  pushState() {
    this._stateStack.push({
      clipRect: this._clipRect
    });
  }

  popState() {
    const state = this._stateStack.pop();
    if(!state) { throw new Error('No state to pop'); }
    this._clipRect = state.clipRect;
  }

  clearClipRect() {
    this._clipRect = new Rect({x: 0, y: 0}, this.size);
  }

  clip(rect: Rect) {
    this._clipRect = this._clipRect.intersect(rect);
  }

  // Put a string at a point. Attributes are either new attributes or a function which
  // takes the existing cell attributes and returns new ones.
  putText(x: number, y: number, text: string, attributes: AttributesParam) {
    Array.from(text).forEach((glyph, glyphIndex) => {
      const p = {x: x + glyphIndex, y};
      if(!this._clipRect.contains(p)) { return; }
      const cell = this._cells[this.pointToIndex(p)];
      if(!cell) { return; }
      cell.glyph = glyph;
      applyAttributes(cell, attributes);
    });

    this.markRectDirty(this._clipRect.intersect(new Rect(
      {x, y}, {width: text.length, height: 1}
    )));
  }

  // Fill a region
  fillRect(rect: Rect, glyph: string, attributes: AttributesParam) {
    // Clip fill region to clip rect
    rect = rect.intersect(this._clipRect);

    // Early out if nothing left to draw
    if(rect.isZeroSized) { return; }

    // Fill each row
    for(let y=rect.top; y <= rect.bottom; ++y) {
      const index = this.pointToIndex({x: rect.left, y});
      this._cells.slice(index, index + rect.width).forEach(cell => {
        cell.glyph = glyph;
        applyAttributes(cell, attributes);
      });
    }

    this.markRectDirty(rect);
  }

  // Current buffer size
  get size() {
    return this._size;
  }

  // Is dirty region non-zero in size?
  get isDirty() {
    return (this._dirtyRect.width > 0) && (this._dirtyRect.height > 0);
  }

  // Convert linear index to point in buffer
  indexToPoint(index: number): Point {
    const x = index % this._size.width;
    const y = (index - x) / this._size.width;
    return {x, y};
  }

  // Convert point to linear index
  pointToIndex({x, y}: Point) {
    return x + y * this._size.width;
  }

  // Resize buffer. Marks entire buffer as dirty.
  resize({width, height}: Size) {
    this._size = {width, height};
    this._cells = (new Array(width * height)).fill(undefined).map(() => ({
      glyph: ' ', attributes: {
        foregroundFillStyle: '#fff',
        backgroundFillStyle: '#000',
      },
    }));
    this.clearClipRect();
  }

  // Update current dirty rectangle
  protected setDirtyRect(rect: Rect) {
    this._dirtyRect = rect;
  }

  // Reset dirty region
  protected resetDirty() {
    this.setDirtyRect(new Rect({x: 0, y: 0}, {width: 0, height: 0}));
  }

  // Mark a rectangle of the buffer as dirty.
  protected markRectDirty(rect: Rect) {
    this.setDirtyRect(this._dirtyRect.union(rect));
  }

  // Mark entire buffer as dirty.
  protected markAllDirty() {
    this.setDirtyRect(new Rect({x: 0, y: 0}, this.size));
  }
};
