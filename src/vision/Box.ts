import { PackOptions, Size } from './types';
import Group from './Group';
import Rect from './Rect';
import View from './View';

const DEFAULT_PACK_OPTIONS = {grow: 0};
const DEFAULT_BOX_OPTIONS = {spacing: 0};

export default class Box extends Group {
  protected _packOptionsMap: Map<View, PackOptions>;
  protected _orientation: 'vertical' | 'horizontal';

  constructor(bounds: Rect, orientation: 'vertical' | 'horizontal') {
    super(bounds);
    this._packOptionsMap = new Map();
    this._orientation = orientation;
  }

  addView(view: View, packOptions: PackOptions = {}) {
    const returnValue = super.addView(view);
    this._packOptionsMap.set(view, packOptions);
    this.repackViews();
    return returnValue;
  }

  removeView(view: View) {
    super.removeView(view);
    this._packOptionsMap.delete(view);
    this.repackViews();
  }

  setBounds(...args: Parameters<View["setBounds"]>) {
    super.setBounds(...args);
    this.repackViews();
    return this;
  }

  repackViews() {
    const extent = this.getExtent();

    // How much space do we have to pack views?
    const availableSpace =
      (this._orientation === 'vertical') ? extent.size.height : extent.size.width;

    // Depending on the orientation of the container, we pass the extent width or height as a hint
    // to sub-views.
    const widthHint = (this._orientation === 'vertical') ? extent.size.width : null;
    const heightHint = (this._orientation === 'vertical') ? null : extent.size.height;

    // Compute the ideal sizes along the appropriate direction for each packed view and
    // store in an array alongside the actual cross-axis size for each view and the pack
    // parameters.
    const augmentedViews = this._views.map(view => {
      const idealSize = view.getIdealSize(widthHint, heightHint);
      const packOptions = this.getPackOptionsForView(view);
      return {view, idealSize, packOptions};
    });

    // Compute the total ideal length for all views assuming no growing.
    const minimumLength = augmentedViews.reduce((sum, {view, idealSize}) => (
      sum + ((this._orientation === 'vertical') ? idealSize.height : idealSize.width)
    ), 0);

    // Compute the total grow weighting.
    const totalGrow = augmentedViews.reduce((sum, {packOptions: {grow}}) => sum + grow, 0);

    // How much length do we have left to apportion to the growing views?
    let lengthToApportion = Math.max(0, availableSpace - minimumLength);

    // Hence, compute the extra space per grow weight.
    const lengthPerGrow = (lengthToApportion !== 0) ? lengthToApportion / totalGrow : 0;

    // Pack all views.
    let currentPosition = 0;
    augmentedViews.forEach(({view, idealSize, packOptions: {grow}}) => {
      const extraLength = Math.min(lengthToApportion, Math.round(lengthPerGrow * grow));
      lengthToApportion -= extraLength;

      if(this._orientation === 'vertical') {
        view.setBounds(
          new Rect(
            {x: 0, y: currentPosition},
            {width: idealSize.width, height: idealSize.height + extraLength}
          )
        );
        currentPosition += idealSize.height + extraLength;
      } else {
        view.setBounds(
          new Rect(
            {x: currentPosition, y: 0},
            {width: idealSize.width + extraLength, height: idealSize.height}
          )
        );
        currentPosition += idealSize.width + extraLength;
      }
    });

    this.scheduleDraw();
  }

  protected getPackOptionsForView(view: View) {
    return {...DEFAULT_PACK_OPTIONS, ...this._packOptionsMap.get(view)};
  }
};

export class VBox extends Box {
  constructor(bounds: Rect) {
    super(bounds, 'vertical');
  }
};

export class HBox extends Box {
  constructor(bounds: Rect) {
    super(bounds, 'horizontal');
  }
};
