import * as React from 'react'
import useComponentSize from '@rehooks/component-size'

import Screen from './components/Screen';

import './App.css';

export default () => {
  const ref = React.useRef<HTMLDivElement>(null);
  // const { width: windowWidth, height: windowHeight } = useComponentSize(ref);
  const windowWidth = 640, windowHeight = 400;
  const [rows, setRows] = React.useState<React.ComponentProps<typeof Screen>['rows']>([]);

  const screenRowCount = Math.floor((windowHeight || 640) / 16);
  const screenColCount = Math.floor((windowWidth || 400) / 8);

  React.useEffect(() => {
    console.log(screenRowCount, screenColCount);
    const rows = Array(screenRowCount).fill(null).map(() => (
      Array(screenColCount).fill(null).map(() => ({
        glyph: '\u2591',
        foregroundColour: '#00f',
        backgroundColour: '#888',
      }))
    ));

    rows[0] = rows[0].map(cell => ({...cell, foregroundColour: '#000', glyph: ' '}));
    rows[rows.length-1] = rows[rows.length-1].map(
      cell => ({...cell, foregroundColour: '#000', glyph: ' '})
    );
    Array.from('File').forEach((glyph, idx) => {rows[0][idx+2].glyph = glyph});
    rows[0][2].foregroundColour = '#800';

    setRows(rows);
  }, [screenRowCount, screenColCount]);

  return (
    <div className="App" ref={ref}>
      <Screen rows={rows} rowCount={screenRowCount} colCount={screenColCount}/>
    </div>
  );
};
