import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from "react-redux";

import store from "./redux/store";
import App from "./App";

import { Web3Provider } from "react-web3";

import * as serviceWorker from "./serviceWorker";

// Ensure that <App /> doesn't render until we confirm web3 is available
ReactDOM.render(<Web3Provider>
    <Provider store={store}>
      <App />
    </Provider>
  </Web3Provider>, document.getElementById('root'),
);
// ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
