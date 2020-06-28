import { Point } from './types';
import DrawBuffer from './DrawBuffer';
import Rect from './Rect';
import Group from './Group';

export default class View {
  protected _bounds: Rect;
  protected _ownerGroup?: Group;

  constructor(bounds: Rect) {
    this._bounds = bounds;
  }

  // Return the minimum size for the view's content.
  getMinimumSize() {
    return {width: 0, height: 0};
  }

  // Return the maximum size for the view's content.
  getMaximumSize() {
    return {width: Infinity, height: Infinity};
  }

  // Return the current bounds of the view within the parent group.
  getBounds() {
    return this._bounds;
  }

  // Update the bounds of this view within the parent group.
  setBounds(bounds: Rect) {
    this.scheduleDraw(this.getBounds());
    this._bounds = bounds;
    this.scheduleDraw(this.getBounds());
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
    this._ownerGroup.scheduleDraw(rect && new Rect(this.localToGlobal(rect.topLeft), rect.size));
  }

  // Draw view into the specified draw buffer. Note that the buffer uses *global* co-ordinates and
  // so you must take care to respect any non-zero origin from getExtent(). The localToGlobal() and
  // globalToLocal() methods can be used to aid mapping points.
  draw(drawBuffer: DrawBuffer) {}

  // Called when a view is added to a new group. Should usually only need to be called by the
  // vision library.
  claim(newOwner?: Group) {
    if(newOwner === this._ownerGroup) { return; }
    this._ownerGroup = newOwner;
    this.scheduleDraw();
  }
};
