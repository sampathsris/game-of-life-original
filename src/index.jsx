import React from 'react';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { CELLWIDTH, COLUMNS, ROWS } from './constants';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import createAutomataReducer from './automata';
import { createRoot } from 'react-dom/client';

window.data_doNotTime = true;
const automataReducer = createAutomataReducer(COLUMNS, ROWS, CELLWIDTH);
const store = createStore(automataReducer);
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
