import View from './View';
import Rect from './Rect';
import DrawBuffer from './DrawBuffer';

export default class Group extends View {
  protected _drawBuffer?: DrawBuffer;
  protected _views: View[];
  protected _isDrawing: boolean;
  protected _drawTimeout: null | ReturnType<typeof setTimeout>;

  constructor(bounds: Rect) {
    super(bounds);
    this._views = [];
    this._isDrawing = false;
    this._drawTimeout = null;
  }

  // Only non-NULL when this group is drawing.
  get drawBuffer() {
    if(!this._isDrawing) { return null; }
    return this._drawBuffer || null;
  }

  setDrawBuffer(drawBuffer: DrawBuffer) {
    this._drawBuffer = drawBuffer;
    this.scheduleDraw();
  }

  setViews(views: View[] | ((views: View[]) => View[])) {
    if(views instanceof Function) {
      this._views = views(this._views);
    } else {
      this._views = views;
    }
    this._views.forEach(view => view.claim(this));
    this.scheduleDraw();
  }

  scheduleDraw() {
    if(this._drawTimeout === null) {
      this._drawTimeout = setTimeout(() => {
        this.drawSubViews();
        this._drawTimeout = null;
        if(this._ownerGroup) {
          this._ownerGroup.scheduleDraw()
        }
      }, 0);
    }
  }

  draw() {
    console.error('TODO: blit draw buffer');
  }

  drawSubViews() {
    const drawBuffer = this._drawBuffer;
    if(!drawBuffer) { return; }

    this._isDrawing = true;
    drawBuffer.pushState();
    drawBuffer.clearClipRect();

    // Draw child views back to front
    for(let idx=this._views.length-1; idx >= 0; --idx) {
      const view = this._views[idx];
      drawBuffer.pushState();
      drawBuffer.clip(view.bounds);
      view.draw();
      drawBuffer.popState();
    }

    drawBuffer.popState();
    this._isDrawing = false;
  }
};
