import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import {createBrowserHistory} from 'history';

const history = createBrowserHistory();

ReactDOM.render(
  <BrowserRouter history = {history}>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
