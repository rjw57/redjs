import { CellAttributes } from './types';
import DrawBuffer from './DrawBuffer';
import Rect from './Rect';
import View from './View';

export default class FilledFrame extends View {
  protected _glyph: string;
  protected _attributes: CellAttributes

  constructor(bounds: Rect, glyph: string, attributes: CellAttributes) {
    super(bounds);
    this._glyph = glyph;
    this._attributes = attributes;
  }

  draw(drawBuffer: DrawBuffer) {
    drawBuffer.fillRect(
      this.getBounds().intersect(drawBuffer.getClipRect()), this._glyph, this._attributes
    );
  }
}