import React, { Component } from "react";
import { withRouter } from "react-router";
import { Container, Col, Row, Form, FormGroup } from "reactstrap";

import { Heading, Field, Input, Button, Card, Text } from "rimble-ui";

import { Redirect } from "react-router-dom";

class RequestLending extends Component {
  constructor(props) {
    super(props);

    const { drizzle, drizzleState } = this.props;

    this.state = {
      account: drizzleState.accounts[0],
      hasDebt: false,
      loanAmount: 0,
      lender: "",
      loanStatus: "",
      debtTotalAmount: 0,
      repaidAmount: 0,
      openingTime: "",

      status: "initialized",
      modal: false,
      transactionHash: "",
      modalSuccess: true,
      modalPending: true
    };

    this.contracts = props.drizzle.contracts;
    this.drizzle = props.drizzle;
    this.web3 = props.drizzle.web3;
    this.onFormSubmit = this.onFormSubmit.bind(this);
    this.hasDebt = this.hasDebt.bind(this);
    this.getDebtInfo = this.getDebtInfo.bind(this);
    this.submitButton = this.submitButton.bind(this);
    this.modalToggle = this.modalToggle.bind(this);
  }

  modalToggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        if (drizzleState.transactionStack[this.state.transactionId]) {
          const transactionHash =
            drizzleState.transactionStack[this.state.transactionId];
          if (
            drizzleState.transactions[transactionHash].status == "pending" &&
            this.state.modalPending
          ) {
            this.setState({
              transactionHash: transactionHash,
              modalPending: false
            });
            window.location.reload();
          }

          if (
            drizzleState.transactions[transactionHash].status == "success" &&
            this.state.modalSuccess
          ) {
            this.setState({
              transactionHash: transactionHash,
              modalSuccess: false
            });
          }
        }
      }
    });

    this.hasDebt();
  }

  onFormSubmit(event) {
    event.preventDefault();
    const stackId = this.contracts.Debt.methods.requestLending.cacheSend({
      from: this.state.account
    });
    this.setState({ transactionId: stackId });
  }

  hasDebt() {
    this.contracts.Debt.methods
      .debts(this.state.account)
      .call({ from: this.state.account })
      .then(result => {
        if (result.status != "" && result.amount > 0) {
          var amount = result.amount;
          var debtTotalAmount = result.debtTotalAmount;
          var repaidAmount = result.repaidAmount;

          amount = this.drizzle.web3.utils.fromWei(amount, "ether");
          debtTotalAmount = this.drizzle.web3.utils.fromWei(
            debtTotalAmount,
            "ether"
          );
          repaidAmount = this.drizzle.web3.utils.fromWei(repaidAmount, "ether");

          this.setState({
            hasDebt: true,
            loanAmount: amount,
            lender: result.lender,
            loanStatus: result.status,
            debtTotalAmount: debtTotalAmount,
            repaidAmount: repaidAmount,
            openingTime: result.openingTime
          });
        }
        console.log(
          "RR: " +
            result.amount +
            ",  lender: " +
            result.lender +
            ", state: " +
            result.status
        );
      });
  }

  getDebtInfo() {
    return (
      <>
        <Heading.h2>Current Debt</Heading.h2>
        <Card className="mt-4 mx-auto">
          <Text mb={4}>Debt amount: {this.state.loanAmount} ETH</Text>
          <Text mb={4}>Lender: {this.state.lender}</Text>
          <Text mb={4}>Status: {this.state.loanStatus}</Text>
          <Text mb={4}>
            Debt total amount: {this.state.debtTotalAmount} ETH
          </Text>
          <Text mb={4}>Repaid amount: {this.state.repaidAmount} ETH</Text>
        </Card>
      </>
    );
  }

  submitButton() {
    return (
      <>
        <Card className="mt-4 mx-auto">
          <Form className="form" onSubmit={this.onFormSubmit}>
            <center>
              <Button type="submit">Request Lending</Button>
            </center>
          </Form>
        </Card>
      </>
    );
  }

  render() {
    var cardContent = this.submitButton();

    if (this.state.hasDebt) {
      cardContent = this.getDebtInfo();
    }

    return (
      <>
        <Container className="mt-4">
          <Row className="justify-content-center">
            <Col lg="6">{cardContent}</Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default withRouter(RequestLending);
