import { Size, Point, CellAttributes } from './types';
import DrawBuffer from './DrawBuffer';
import Rect from './Rect';
import Group from './Group';

const DEFAULT_OPTS = {
  bounds: new Rect({x: 0, y: 0}, {width: 1, height: 1}),
};

export interface ViewOptions {
  bounds?: Rect;
};

export default class View {
  protected _bounds: Rect;
  protected _ownerGroup?: Group;
  protected _minimumSize: Size;
  protected _maximumSize: Size;
  protected _backgroundGlyph: string;
  protected _backgroundAttributes: CellAttributes;

  constructor(opts?: ViewOptions) {
    const {bounds} = {...DEFAULT_OPTS, ...opts};
    this._bounds = bounds;
    this._minimumSize = {width: 0, height: 0};
    this._maximumSize = {width: Infinity, height: Infinity};
    this._backgroundGlyph = ' ';
    this._backgroundAttributes = {foregroundFillStyle: '#fff', backgroundFillStyle: '#000'};
  }

  // Set the background glyph and attributes. Returns this for chaining.
  setBackground(glyph: string, attributes: CellAttributes) {
    this._backgroundGlyph = glyph;
    this._backgroundAttributes = attributes;
    this.scheduleDraw();
    return this;
  }

  // Return the minimum size for the view's bounds..
  getMinimumSize() {
    return this._minimumSize;
  }

  // Set the minimum size for the view's bounds. Returns this to allow chaining.
  setMinimumSize(size: Size) {
    this._minimumSize = size;
    return this;
  }

  // Return the maximum size for the view's bounds.
  getMaximumSize() {
    return this._maximumSize;
  }

  // Set the maximum size for the view's bounds. Returns this to allow chaining.
  setMaximumSize(size: Size) {
    this._maximumSize = size;
    return this;
  }

  // Get the ideal size for the view based on a hinted size. Pass null for widthHint or heightHint
  // if there is no hint for that size. The default behaviour is to return the hint if it lies
  // between minimum and maximum or to return the minimum if the hint is null or out of range.
  //
  // Derived classes may provide a smarter implementation.
  getIdealSize(widthHint: number | null = null, heightHint: number | null = null) : Size {
    const minSize = this.getMinimumSize();
    const maxSize = this.getMaximumSize();
    return {
      width: (widthHint === null)
        ? minSize.width
        : Math.max(minSize.width, Math.min(maxSize.width, widthHint)),
      height: (heightHint === null)
        ? minSize.height
        : Math.max(minSize.height, Math.min(maxSize.height, heightHint)),
    };
  }

  // Return the current bounds of the view within the parent group.
  getBounds() {
    return this._bounds;
  }

  // Update the bounds of this view within the parent group. Returns this to allow chaining.
  setBounds(bounds: Rect) {
    this._bounds = bounds;
    this.scheduleDraw();
    return this;
  }

  // Return the current extent of the view. This is the visible area in view-local co-ordinates.
  getExtent() {
    return new Rect({x: 0, y: 0}, this._bounds.size);
  }

  // Map a point in view-local co-ordinates to co-ordinates relative to the extent of the enclosing
  // group.
  localToGlobal({x, y}: Point) {
    const extent = this.getExtent();
    const bounds = this.getBounds();
    return {x: bounds.left + x - extent.left, y: bounds.top + y - extent.top};
  }

  // Map a point in co-ordinates relative to the extent of the enclosing group to view-local
  // co-ordinates.
  globalToLocal({x, y}: Point) {
    const extent = this.getExtent();
    const bounds = this.getBounds();
    return {x: extent.left + x - bounds.left, y: extent.top + y - bounds.top};
  }

  // Schedule a re-draw of the view. If rect is passed it is the minimum area to redraw of the view
  // in view-local co-ordinates.
  scheduleDraw(rect?: Rect) {
    // If there is no owner group, do nothing.
    if(!this._ownerGroup) { return; }

    // If no rect is passed, use extent.
    rect = rect || this.getExtent();
    this._ownerGroup.scheduleDraw(new Rect(this.localToGlobal(rect.topLeft), rect.size));
  }

  // Draw view into the specified draw buffer. Note that the buffer uses *local* co-ordinates.
  draw(drawBuffer: DrawBuffer) {
    drawBuffer.fillRect(
      this.getExtent().intersect(drawBuffer.getClipRect()),
      this._backgroundGlyph,
      this._backgroundAttributes
    );
  }

  // Called when a view is added to a new group. Should usually only need to be called by the
  // vision library.
  claim(newOwner?: Group) {
    if(newOwner === this._ownerGroup) { return; }
    this._ownerGroup = newOwner;
    this.scheduleDraw();
  }
};
