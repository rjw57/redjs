import { PackOptions } from './types';

import View from './View';
import Rect from './Rect';
import DrawBuffer from './DrawBuffer';

export default class Group extends View {
  protected _drawBuffer?: DrawBuffer;
  protected _views: [View, PackOptions][];
  protected _drawTimeout: null | ReturnType<typeof setTimeout>;

  constructor(bounds: Rect) {
    super(bounds);
    this._views = [];
    this._drawTimeout = null;
  }

  setDrawBuffer(drawBuffer: DrawBuffer) {
    this._drawBuffer = drawBuffer;
    this.scheduleDraw(this.getExtent());
  }

  addView(view: View, packOptions: PackOptions = {}) {
    this._views.push([view, packOptions]);
    view.claim(this);
    this.repackViews();
    this.scheduleDraw(this.getBounds());
  }

  removeView(view: View) {
    this._views = this._views.filter(([v, ..._]) => v !== view);
    view.claim();
    this.repackViews();
    this.scheduleDraw(this.getBounds());
  }

  setBounds(...args: Parameters<View["setBounds"]>) {
    super.setBounds(...args);
    this.repackViews();
  }

  repackViews() {}

  scheduleDraw(rect?: Rect) {
    if(this._drawTimeout === null) {
      this._drawTimeout = setTimeout(() => {
        if(this._drawBuffer) {
          this._drawBuffer.pushState();
          if(rect) { this._drawBuffer.clip(rect); }
          this.drawSubViews(this._drawBuffer);
          this._drawBuffer.popState();
        }
        super.scheduleDraw(rect);
        this._drawTimeout = null;
      }, 0);
    }
  }

  draw(drawBuffer: DrawBuffer) {
    if(this._drawBuffer) {
      console.error('TODO: blit draw buffer');
    } else {
      this.drawSubViews(drawBuffer);
    }
  }

  drawSubViews(drawBuffer: DrawBuffer) {
    drawBuffer.pushState();
    drawBuffer.clearClipRect();

    // Draw child views back to front
    for(let idx=this._views.length-1; idx >= 0; --idx) {
      const [view, ..._] = this._views[idx];
      drawBuffer.pushState();
      drawBuffer.clip(view.getBounds());
      view.draw(drawBuffer);
      drawBuffer.popState();
    }

    drawBuffer.popState();
  }
};
