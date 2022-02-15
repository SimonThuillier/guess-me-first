import React from "react"
import ReactDOM from 'react-dom'
import './App.scss';
import App from './App';
import {hasValidPlayerId, createPlayerId} from './utils';

// create a playerId that will identify this player browser
if (!hasValidPlayerId()) {
  createPlayerId();
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
