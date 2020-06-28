import { Point, Size } from './types';

export default class Rect {
  protected _topLeft: Point;
  protected _size: Size;

  constructor(topLeft: Point, size: Size) {
    this._topLeft = topLeft;
    this._size = size;
  }

  get size() { return this._size; }
  get width() { return this.size.width; }
  get height() { return this.size.height; }

  get topLeft() { return this._topLeft; }
  get bottomRight() { return {x: this.right, y: this.bottom}; }

  get top() { return this.topLeft.y; }
  get bottom() { return this.top + this.height - 1; }
  get left() { return this.topLeft.x; }
  get right() { return this.left + this.width - 1; }

  get isZeroSized() { return (this.width === 0) || (this.height === 0); }

  contains({x, y}: Point) {
    if((x < this.left) || (x > this.right)) { return false; }
    if((y < this.top) || (y > this.bottom)) { return false; }
    return true;
  }

  union(otherRect: Rect) {
    if(this.isZeroSized) { return otherRect; }
    if(otherRect.isZeroSized) { return this; }

    const top = Math.min(this.top, otherRect.top);
    const bottom = Math.max(this.bottom, otherRect.bottom);
    const left = Math.min(this.left, otherRect.left);
    const right = Math.max(this.right, otherRect.right);

    return new Rect({x: left, y: top}, {width: 1+right-left, height: 1+bottom-top});
  }

  intersect(otherRect: Rect) {
    if(this.isZeroSized) { return new Rect(this.topLeft, {width: 0, height: 0}); }
    if(otherRect.isZeroSized) { return new Rect(otherRect.topLeft, {width: 0, height: 0}); }
    const xRange = intersectRange(this.left, this.width, otherRect.left, otherRect.width);
    const yRange = intersectRange(this.top, this.height, otherRect.top, otherRect.height);
    return new Rect({x: xRange.min, y: yRange.min}, {width: xRange.len, height: yRange.len});
  }
};

const intersectRange = (minA: number, aLen: number, minB: number, bLen: number): {min: number, len: number} => {
  // A entirely to left of B
  if(minA + aLen <= minB) { return {min: 0, len: 0}; }

  // B entirely to left of A
  if(minB + bLen <= minA) { return {min: 0, len: 0}; }

  // A entirely within B
  if((minA >= minB) && (minA + aLen <= minB + bLen)) { return {min: minA, len: aLen}; }

  // B entirely within A
  if((minB >= minA) && (minB + bLen <= minA + aLen)) { return {min: minB, len: bLen}; }

  // Only remaining case is where A and B overlap
  const min = Math.max(minA, minB);
  const max = Math.min(minA + aLen, minB + bLen);
  return {min, len: max-min};
};
