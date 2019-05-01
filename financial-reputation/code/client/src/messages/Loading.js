import React from "react";
import "./Loading.css";
import { Icon } from "rimble-ui";

const Loading = () => (
  <div className="loading-wrapper">
    <Icon name="AccountBalance" color="primary" className="loading-icon" />
    <h4 className="mt-0">Loading...</h4>
    <p className="text-center">Use Rinkeby or Sokol POA Test Network</p>
  </div>
);

export default Loading;
