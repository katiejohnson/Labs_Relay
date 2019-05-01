import React, { Component } from "react";
import { Container, Col, Row, Form, FormGroup } from "reactstrap";

import { Heading, Field, Input, Button, Card, Text } from "rimble-ui";

class Instructions extends Component {
  render() {
    return (
      <>
        <Container className="mt-4">
          <Row className="justify-content-center">
            <Col lg="6">
              <Heading.h2>Instructions</Heading.h2>
              <Card className="mt-4 mx-auto">
                <Text mb={4}>
                  Ristretto is a Peer to Peer lending platform where the debt is
                  backed by friends, family or people that trust in the
                  borrower.
                  <br />
                  The users can have different roles in the platform, they can
                  be <b>Endorsers</b>, <b>Borrowers</b> or <b>Lenders</b>.
                  <Heading.h4>Endorser</Heading.h4>
                  The endorsers are friends or family of the borrower, they
                  trust that the borrower is able to pay and is a honest person.
                  These users are the ones that takes the risk when an user
                  doesn't pay a debt, the risk is divided between all the
                  endorsers of a borrower.
                  <br />
                  <br />
                  <b>Actions:</b>
                  <br />
                  <ul>
                    <li>Stake Money</li>
                    <li>Endorse Users</li>
                    <li>Earn interest money from honest borrower</li>
                    <li>Close Debt</li>
                  </ul>
                  <Heading.h4>Borrower</Heading.h4>
                  Borrowers are the users that require money. In order for a
                  borrower to request a lending they first need other users to
                  endorse them.
                  <br />
                  <br />
                  <b>Actions:</b>
                  <br />
                  <ul>
                    <li>Receive Endorsement</li>
                    <li>Request Lending</li>
                    <li>Receive Money</li>
                    <li>Repay Money + 5% Interest in less than 2 months</li>
                    <li>Close Debt</li>
                  </ul>
                  <Heading.h4>Lender</Heading.h4>
                  Lenders are the users that provide the money for a borrower,
                  they can analize if a borrower has many endorsers and are able
                  to provide the money for it's debt.
                  <br />
                  <br />
                  <b>Actions:</b>
                  <br />
                  <ul>
                    <li>Lend Money</li>
                    <li>Regain your Money plus an interest</li>
                    <li>Close Debt</li>
                  </ul>
                  <b>
                    *If in two months the borrower doesn't pay anyone can call
                    Force Close Debt and the endorsers will pay the lending
                  </b>
                </Text>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  }
}

export default Instructions;
