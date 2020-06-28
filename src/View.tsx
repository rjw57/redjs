import Rect from './Rect';
import Group from './Group';

export default class View {
  protected _bounds: Rect;
  protected _ownerGroup?: Group;

  constructor(bounds: Rect) {
    this._bounds = bounds;
  }

  claim(newOwner: Group) {
    this._ownerGroup = newOwner;
  }

  get bounds() {
    return this._bounds;
  }

  setBounds(bounds: Rect) {
    this._bounds = bounds;
    this.scheduleDraw();
  }

  // Current draw buffer or null if there is none.
  get drawBuffer() {
    if(!this._ownerGroup) { return null; }
    return this._ownerGroup.drawBuffer;
  }

  scheduleDraw() {
    if(!this._ownerGroup) { return; }
    this._ownerGroup.scheduleDraw();
  }

  draw() {}
};
