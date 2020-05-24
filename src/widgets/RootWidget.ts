import {Display} from './Display';
import {Widget} from './Widget';

export class RootWidget extends Widget {
  display: Display;

  constructor(display: Display) {
    super(null);
    this.display = display;
    this.display.on('resize', ({lineCount, columnCount}) => {
      this.setSize(lineCount, columnCount);
      console.log(lineCount, columnCount);
      //this.display.setBuffer(this.render({
      //  firstLine: 0, lineCount, firstColumn: 0, columnCount
      //}));
    });
  }
};
