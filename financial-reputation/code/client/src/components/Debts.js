import React, { Component } from "react";
import { withRouter } from "react-router";
import { Container, Col, Row, Form, FormGroup } from "reactstrap";

import {
  Heading,
  Field,
  Input,
  Button,
  Card,
} from "rimble-ui";

import  { Redirect } from 'react-router-dom'

class Debts extends Component {

    constructor(props) {
        super(props);

        const { drizzle, drizzleState } = this.props;

        this.state = {
          account: drizzleState.accounts[0],

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
          modalPending: true,
        };

        this.contracts = props.drizzle.contracts;
        this.drizzle = props.drizzle;
        this.web3 = props.drizzle.web3;
        //this.createTable = this.createTable.bind(this);
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
    }

    createTable = () => {
        this.contracts.Debt.methods.debts(this.state.account).call({'from': this.state.account})
            .then((result) => {
                this.state.loanAmount = result.amount;
                this.state.lender = result.lender;
                this.state.loanStatus = result.status;
                this.state.debtTotalAmount = result.debtTotalAmount;
                this.state.repaidAmount = result.repaidAmount;
                this.state.openingTime = result.openingTime;

                console.log('RR: ' + result.amount + ',  lender: ' + result.lender + ', state: ' + result.status);
            });
    }


    render() {
        return (
          <>
            <Container className="mt-4">
              <Row className="justify-content-center">
                <Col lg="6">
                  <Card className="mt-4 mx-auto">
                    <Form className="form" >
                      <table>
                            <thead>
                              <tr>
                                <th>Amount</th>
                                <th>Lender</th>
                                <th>Status</th>
                                <th>Debt Total Amount</th>
                                <th>Repaid Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                                { this.createTable() }
                            </tbody>
                      </table>
                    </Form>
                  </Card>
                </Col>
              </Row>
            </Container>
          </>
        );
    }

}


export default withRouter(Debts);