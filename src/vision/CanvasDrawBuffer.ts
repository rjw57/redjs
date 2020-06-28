import { Size } from './types';
import Rect from './Rect';

import DrawBuffer from './DrawBuffer';

export default class CanvasDrawBuffer extends DrawBuffer {
  private canvas: HTMLCanvasElement;
  private font: string;
  private glyphWidth: number;
  private glyphHeight: number;
  private redrawTimeout: null | ReturnType<typeof setTimeout>;

  constructor(canvas: HTMLCanvasElement) {
    super();
    this.canvas = canvas;
    this.font = 'monospaced 16px';
    this.glyphWidth = 8;
    this.glyphHeight = 16;
    this.redrawTimeout = null;
    this.resize(this.getCanvasSize());
    this.redraw(true);
  }

  // Return current canvas size in glyphs (rounded down).
  getCanvasSize(): Size {
    return {
      width: Math.floor(this.canvas.width / (window.devicePixelRatio * this.glyphWidth)),
      height: Math.floor(this.canvas.height / (window.devicePixelRatio * this.glyphHeight)),
    };
  }

  // Re-draw dirty region. If clearAll is true, clear *entire* canvas first.
  redraw(clearAll: boolean = false) {
    if(!this.isDirty) { return; }
    const ctx = this.canvas.getContext('2d');
    if(!ctx) { return; }

    if(clearAll) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ctx.save();

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    ctx.font = this.font;
    ctx.textBaseline = 'bottom';

    console.log('drawing: ', this._dirtyRect);
    let startIndex = this.pointToIndex({x: this._dirtyRect.left, y: this._dirtyRect.top});
    for(let y=this._dirtyRect.top; y < this._dirtyRect.top + this._dirtyRect.height; ++y, startIndex += this.size.width) {
      this._cells.slice(startIndex, startIndex+this._dirtyRect.width).forEach(
        ({glyph, attributes: {foregroundFillStyle, backgroundFillStyle}}, cellIdx) => {
          const x = this._dirtyRect.left + cellIdx;
          ctx.fillStyle = backgroundFillStyle;
          ctx.fillRect(x * this.glyphWidth, y * this.glyphHeight, this.glyphWidth, this.glyphHeight);
          ctx.fillStyle = foregroundFillStyle;
          ctx.fillText(glyph, x * this.glyphWidth, (y+1) * this.glyphHeight);
        }
      );
    }

    ctx.restore();

    this.resetDirty();
  }

  resize(size: Size) {
    // Redraw on resize
    super.resize(size);
    this.markAllDirty();
    this.redraw(true);
  }

  // Change font. Immediately calls redraw.
  setFont(font: string, glyphWidth: number, glyphHeight: number) {
    this.font = font;
    this.glyphWidth = glyphWidth;
    this.glyphHeight = glyphHeight;
    this.markAllDirty();
    this.redraw(true);
  }

  // When dirty rect changes, schedule redraw for next event loop.
  protected setDirtyRect(rect: Rect) {
    super.setDirtyRect(rect);

    // If new dirty rect is zero size, don't redraw
    if((rect.width === 0) || (rect.height === 0)) { return; }

    // If there is a timeout in flight, don't redraw
    if(this.redrawTimeout) { return; }

    // Schedule redraw
    this.redrawTimeout = setTimeout(() => {
      this.redraw();
      this.redrawTimeout = null;
    }, 0);
  }
};
