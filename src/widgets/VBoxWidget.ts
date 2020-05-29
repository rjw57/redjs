import {Buffer, Cell} from '../buffer';

import {Widget} from './Widget';
import {Region} from './types';

interface ChildPack {
  child: Widget;
  startLine: number;
};

export class VBoxWidget extends Widget {
  private children: Array<Widget>;

  constructor() {
    super()
    this.children = [];
  }

  add(child: Widget) {
    super.add(child);
    this.children.push(child);
    this.repack();
  }

  remove(child: Widget) {
    super.remove(child);
    this.children = this.children.filter((w) => w !== child);
    this.repack();
  }

  private repack() {
  }

  redraw(region: Region) : Buffer {
    return super.redraw(region);
  }
};


