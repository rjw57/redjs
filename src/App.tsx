import * as React from 'react'

import Screen from './components/Screen';

import './App.css';

export default () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [rows, setRows] = React.useState<React.ComponentProps<typeof Screen>['rows']>([]);

  const render: React.ComponentProps<typeof Screen>['onResize'] = ({rowCount, colCount}) => {
    const rows = Array(rowCount).fill(null).map(() => (
      Array(colCount).fill(null).map(() => ({
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
  };

  React.useEffect(() => { render({rowCount: 25, colCount: 80}) }, []);

//    const randomChange = () => {
//      if(rows) {
//        const row = rows[Math.floor(Math.random() * rows.length)];
//        const cell = row[Math.floor(Math.random() * row.length)];
//        cell.glyph = 'X';
//        console.log('foo');
//        setRows(rows);
//      }
//      window.setTimeout(randomChange, 100);
//    };
//    randomChange();

  //React.useEffect(() => { randomChange(); }, []);

  return (
    <div className="app" ref={ref}>
      <Screen rows={rows} className="app-screen" />
    </div>
  );
};
