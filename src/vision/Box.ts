import { PackOptions, Size } from './types';
import Group from './Group';
import Rect from './Rect';
import View from './View';

const DEFAULT_PACK_OPTIONS = {grow: 0};

export class VBox extends Group {
  protected _packOptionsMap: Map<View, PackOptions>;

  constructor(bounds: Rect) {
    super(bounds);
    this._packOptionsMap = new Map();
  }

  addView(view: View, packOptions: PackOptions = {}) {
    super.addView(view);
    packOptions = {...DEFAULT_PACK_OPTIONS, ...packOptions};
    this._packOptionsMap.set(view, packOptions);
    this.repackViews();
  }

  removeView(view: View) {
    super.removeView(view);
    this._packOptionsMap.delete(view);
    this.repackViews();
  }

  setBounds(...args: Parameters<View["setBounds"]>) {
    super.setBounds(...args);
    this.repackViews();
  }

  repackViews() {
    const bounds = this.getBounds();

    // Compute the minimum along axis size of all of the views and thereby determine the extra
    // space which needs apportioning
    const minimumAlongAxisSize = this._views.reduce((accumulator, view) => {
      return accumulator + view.getMinimumSize().height;
    }, 0);
    let remainingAlongAxisSize = Math.max(0, bounds.size.height - minimumAlongAxisSize);

    // Compute the total grow weight for the views.
    const totalGrowWeight = this._views
      .map(v => this.getPackOptionsForView(v))
      .reduce((accumulator, opts) => {
        const {grow} = {...DEFAULT_PACK_OPTIONS, ...opts};
        return accumulator + grow;
      }, 0);

    // Compute the extra space per unit grow.
    const spacePerGrow = (totalGrowWeight === 0) ? 0 : remainingAlongAxisSize / totalGrowWeight;

    let currentPosition = 0;
    this._views.forEach(view => {
      const {grow} = {...DEFAULT_PACK_OPTIONS, ...this.getPackOptionsForView(view)};
      const extraGrow = Math.min(remainingAlongAxisSize, Math.round(spacePerGrow * grow));
      remainingAlongAxisSize -= extraGrow;

      const minSize = view.getMinimumSize();
      const maxSize = view.getMaximumSize();
      const crossLength = Math.min(maxSize.width, bounds.width);
      const alongLength = minSize.height + extraGrow;
      view.setBounds(
        new Rect({x: 0, y: currentPosition}, {width: crossLength, height: alongLength})
      );
      currentPosition += alongLength;
    })

    this.scheduleDraw();
  }

  protected getPackOptionsForView(view: View) {
    return this._packOptionsMap.get(view) || DEFAULT_PACK_OPTIONS;
  }
};
