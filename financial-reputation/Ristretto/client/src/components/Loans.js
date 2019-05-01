import React, { Component } from "react";
import RepayDebt from "./RepayDebt";
import CloseDebt from "./CloseDebt";
import ForceCloseDebt from "./ForceCloseDebt";

class Home extends Component {
  render() {
    return (
      <>
        <RepayDebt
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
        <CloseDebt
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
        <ForceCloseDebt
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
      </>
    );
  }
}

export default Home;
