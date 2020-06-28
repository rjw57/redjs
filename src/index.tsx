import React from 'react'
import ReactDom from 'react-dom'
import styled from 'styled-components';

import './index.css';
import * as serviceWorker from './serviceWorker';

import Application from './Application';

const StyledApp = styled(Application)`position: absolute; left: 0; top: 0; width: 100vw; height 100vh;`;
ReactDom.render(<StyledApp />, document.getElementById('app'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
