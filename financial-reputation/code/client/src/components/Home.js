import React, { Component } from "react";
import RequestLending from "./RequestLending";
import LendMoney from "./LendMoney";

class Home extends Component {
  render() {
    return (
      <>
        <RequestLending
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
        <LendMoney
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
      </>
    );
  }
}

export default Home;
