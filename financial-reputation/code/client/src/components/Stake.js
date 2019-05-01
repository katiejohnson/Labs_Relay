import React, { Component } from "react";
import StakeMoney from "./StakeMoney";
import WithdrawStakeMoney from "./WithdrawStakeMoney";

class Stake extends Component {
  render() {
    return (
      <>
        <StakeMoney
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
        <WithdrawStakeMoney
          drizzleState={this.props.drizzleState}
          drizzle={this.props.drizzle}
        />
      </>
    );
  }
}

export default Stake;
