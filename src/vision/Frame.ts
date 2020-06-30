import { Size, CellAttributes } from './types';
import DrawBuffer from './DrawBuffer';
import Rect from './Rect';
import Group from './Group';
import View, { ViewOptions } from './View';

const FRAME_CHARS = {
  light: {
    vert: '\u2502', horiz: '\u2500',
    topLeft: '\u250c', topRight: '\u2510', bottomLeft: '\u2514', bottomRight: '\u2518',
  },
  heavy: {
    vert: '\u2503', horiz: '\u2501',
    topLeft: '\u250f', topRight: '\u2513', bottomLeft: '\u2517', bottomRight: '\u251b',
  },
  double: {
    vert: '\u2551', horiz: '\u2550',
    topLeft: '\u2554', topRight: '\u2557', bottomLeft: '\u255a', bottomRight: '\u255d',
  },
};

// A frame is a group which can only hold a single view at a time and which adds a decorative frame
// around the wrapped view.
export default class Frame extends Group {
  protected _style: keyof typeof FRAME_CHARS;
  protected _frameAttributes?: CellAttributes;

  constructor(opts?: ViewOptions) {
    super(opts);
    this._style = 'light';
  }

  setFrameAttributes(attributes: CellAttributes) {
    this._frameAttributes = attributes;
    this.scheduleDraw();
    return this;
  }

  setStyle(style: keyof typeof FRAME_CHARS) {
    this._style = style;
    this.scheduleDraw();
    return this;
  }

  getMinimumSize() {
    const view = this.getWrappedView();
    if(!view) { return super.getMinimumSize(); }
    const {width, height} = view.getMinimumSize();
    return {width: width+2, height: height+2};
  }

  getMaximumSize() {
    const view = this.getWrappedView();
    if(!view) { return super.getMaximumSize(); }
    const {width, height} = view.getMaximumSize();
    return {width: width+2, height: height+2};
  }

  getIdealSize(widthHint: number | null = null, heightHint: number | null = null) : Size {
    const view = this.getWrappedView();
    if(!view) { return super.getIdealSize(widthHint, heightHint); }
    const {width, height} = view.getIdealSize(
      widthHint && Math.max(0, widthHint - 2),
      heightHint && Math.max(0, heightHint - 2)
    );
    return {width: width+2, height: height+2};
  }

  addView(view: View) {
    // Make sure that only one view is wrapped at a time.
    while(this._views.length > 0) { this.removeView(this._views[0]); }
    const returnValue = super.addView(view);
    this.repackView();
    return returnValue;
  }

  setBounds(bounds: Rect) {
    const returnValue = super.setBounds(bounds);
    this.repackView();
    return returnValue;
  }

  draw(drawBuffer: DrawBuffer) {
    super.draw(drawBuffer);
    const chars = FRAME_CHARS[this._style];
    const {size: {width, height}} = this.getExtent();
    const attributes = {...this._backgroundAttributes, ...this._frameAttributes};

    drawBuffer.putText(
      0, 0,
      (chars.topLeft + chars.horiz.repeat(Math.max(0, width-2)) + chars.topRight).slice(0, width),
      attributes
    );

    drawBuffer.putText(
      0, Math.max(0, height-1),
      (chars.bottomLeft + chars.horiz.repeat(Math.max(0, width-2)) + chars.bottomRight).slice(0, width),
      attributes
    );

    for(let y=1; y < height-1; ++y) {
      drawBuffer.putText(0, y, chars.vert, attributes);
      drawBuffer.putText(Math.max(0, width - 1), y, chars.vert, attributes);
    }
  }

  protected repackView() {
    const view = this.getWrappedView();
    if(!view) { return; }
    const extent = this.getExtent();
    view.setBounds(extent.inset(1));
  }

  protected getWrappedView() {
    return this._views[0] || null;
  }
}
