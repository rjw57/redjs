export interface MouseEvent {
  type: 'mousemove' | 'mouseclick' | 'mousedown' | 'mouseup';
  line: number;
  column: number;
};

export interface KeyboardEvent {
  type: 'keyup' | 'keydown';
  key: string;
  shiftKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
};

export interface ResizeEvent {
  type: 'resize';
  lineCount: number;
  columnCount: number;
};

export type Event = MouseEvent | KeyboardEvent | ResizeEvent;
