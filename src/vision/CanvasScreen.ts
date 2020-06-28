import CanvasDrawBuffer from './CanvasDrawBuffer';
import Group from './Group';
import Rect from './Rect';

export default class CanvasScreen {
  canvasElement: HTMLCanvasElement;
  rootGroup: Group;
  drawBuffer: CanvasDrawBuffer;

  protected _resizeObserver: ResizeObserver;

  constructor(canvasElement: HTMLCanvasElement, rootGroup: Group) {
    this.canvasElement = canvasElement;
    this.drawBuffer = new CanvasDrawBuffer(this.canvasElement);
    this.rootGroup = rootGroup;
    this.rootGroup.setDrawBuffer(this.drawBuffer);

    this._resizeObserver = new ResizeObserver(entries => entries.forEach(entry => {
      if(entry.target === this.canvasElement) {
        this._canvasResized(entry.contentRect.width, entry.contentRect.height);
      }
    }));
    this._resizeObserver.observe(this.canvasElement);
  }

  setFont(font: string, glyphWidth: number, glyphHeight: number) {
    this.drawBuffer.setFont(font, glyphWidth, glyphHeight);
    this.drawBuffer.resize(this.drawBuffer.getCanvasSize());
    this.rootGroup.setBounds(new Rect({x: 0, y: 0}, this.drawBuffer.getCanvasSize()));
  }

  _canvasResized(width: number, height: number) {
    this.canvasElement.width = width * window.devicePixelRatio;
    this.canvasElement.height = height * window.devicePixelRatio;
    this.drawBuffer.resize(this.drawBuffer.getCanvasSize());
    this.rootGroup.setBounds(new Rect({x: 0, y: 0}, this.drawBuffer.getCanvasSize()));
  }
};
