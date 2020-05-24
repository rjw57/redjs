import * as React from 'react';
import {useMouseHovered, useHoverDirty} from 'react-use';
import useComponentSize from '@rehooks/component-size';

import {Screen} from './components';
import {Buffer} from './buffer';
import {Display, RootWidget} from './widgets';
import {useScreenFont} from './fonts';

import './App.css';

const display = new Display();
const rootWidget = new RootWidget(display);

export default () => {
  const fontSpec = useScreenFont();
  const ref = React.useRef<HTMLDivElement>(null);
  const {elX: mouseX, elY: mouseY} = useMouseHovered(ref, {whenHovered: true});
  const {width, height} = useComponentSize(ref);
  const isHovered = useHoverDirty(ref);

  // Compute current mouse line and column
  const mouseLine = Math.floor(mouseY / fontSpec.glyphHeight);
  const mouseColumn = Math.floor(mouseX / fontSpec.glyphWidth);

  // Compute screen size in lines and columns
  const lineCount = Math.floor(height / fontSpec.glyphHeight);
  const columnCount = Math.floor(width / fontSpec.glyphWidth);

  // Determine if pointer is over screen
  const isMouseActive = isHovered && (mouseLine < lineCount) && (mouseColumn < columnCount);

  // Store display buffer in state and update when display updates
  const [buffer, setBuffer] = React.useState<Buffer | null>(null);
  React.useEffect(() => {display.on('update', ({buffer}) => {setBuffer(buffer);});});

  // Tell display when window has resized
  React.useEffect(() => {display.resize(lineCount, columnCount);}, [lineCount, columnCount]);

  // Keyboard event handler passes event to display
  const keyEventHandler: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    const {type, key, shiftKey, ctrlKey, metaKey, altKey, location, repeat} = event;
    if((type === 'keyup') || (type === 'keydown') || (type === 'keypress')) {
      display.postKeyEvent({type, key, shiftKey, ctrlKey, altKey, metaKey, location, repeat});
    }
  };

  // Mouse event handler passes event to display
  const mouseEventHandler: React.MouseEventHandler<HTMLDivElement> = (event) => {
    let {type} = event;
    if(type === 'click') { type = 'mouseclick'; }
    if((type === 'mousemove') || (type === 'mouseclick') || (type === 'mousedown') || (type === 'mouseup')) {
      display.postMouseEvent({type, line: mouseLine, column: mouseColumn});
    }
  };

  return (
    <div className="app"
      ref={ref}
      onKeyDown={keyEventHandler}
      onKeyUp={keyEventHandler}
      onKeyPress={keyEventHandler}
      onMouseMove={mouseEventHandler}
      onMouseDown={mouseEventHandler}
      onMouseUp={mouseEventHandler}
      onClick={mouseEventHandler}
      tabIndex={0}
    >
      <Screen
        className="app-screen"
        buffer={buffer}
        fontSpec={fontSpec}
        showMouse={isMouseActive}
        mouseLine={mouseLine}
        mouseColumn={mouseColumn}
      />
    </div>
  );
};
