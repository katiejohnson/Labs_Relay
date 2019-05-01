import React, { Component } from "react";
import { DrizzleProvider } from "drizzle-react";
import { HashRouter,
         Route,
         Switch,
         Redirect } from 'react-router-dom';

import LoadingContainer from "./components/LoadingContainer";
import Home from "./components/Home";

import "./App.css";
import drizzleOptions from "./drizzleOptions";

class App extends Component {
  render() {
    return (
      <DrizzleProvider options={drizzleOptions}>
        <LoadingContainer>
          <HashRouter>
            <div>
              <Switch>
                <Route exact path="/home" component={Home} />

                <Redirect from="/" to="/home" />
              </Switch>
            </div>
          </HashRouter>
        </LoadingContainer>
      </DrizzleProvider>
    );
  }
}

export default App;
