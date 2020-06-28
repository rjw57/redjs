import { Size } from './types';
import Group from './Group';
import Rect from './Rect';

export class VBox extends Group {
  repackViews() {
    const bounds = this.getBounds();

    // Compute the minimum along axis size of all of the views and thereby determine the extra
    // space which needs apportioning
    const minimumAlongAxisSize = this._views.reduce((accumulator, [view, _]) => {
      return accumulator + view.getMinimumSize().height;
    }, 0);
    let remainingAlongAxisSize = Math.max(0, bounds.size.height - minimumAlongAxisSize);

    // Compute the total grow weight for the views.
    const totalGrowWeight = this._views.reduce((accumulator, [_, {grow=0}]) => {
      return accumulator + grow;
    }, 0);

    // Compute the extra space per unit grow.
    const spacePerGrow = (totalGrowWeight === 0) ? 0 : remainingAlongAxisSize / totalGrowWeight;

    let currentPosition = 0;
    this._views.forEach(([view, {grow=0}]) => {
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
  }
};
