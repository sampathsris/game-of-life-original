import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { CELLWIDTH, COLUMNS, ROWS } from './constants';

import { createStore } from 'redux';
import { Provider } from 'react-redux';
import createAutomataReducer, { evolve } from './automata';

window.data_doNotTime = true;
const automataReducer = createAutomataReducer(COLUMNS, ROWS, CELLWIDTH);
const store = createStore(automataReducer);

setInterval(() => store.dispatch(evolve()), 0);

ReactDOM.render(
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
