import React from "react";
import { Container, Row, Col } from "shards-react";

import PageTitle from "../components/common/PageTitle";
import UserDetails from "../components/user-profile-lite/UserDetails";
import UserAccountDetails from "../components/user-profile-lite/UserAccountDetails";
// import Web3 from 'web3';

// const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
// let metaaccount
// web3.eth.getAccounts().then( console.log,
//    metaaccount = web3.eth.getAccounts()

// );

// console.log(metaaccount);
const UserProfileLite = () => (
  <Container fluid className="main-content-container px-4">
    <Row noGutters className="page-header py-4">
      <PageTitle title="User Profile" subtitle="Overview" md="12" className="ml-sm-auto mr-sm-auto" />
    </Row>
    <Row>
      <Col lg="4">
        <UserDetails />
      </Col>
      <Col lg="8">
        <UserAccountDetails />
      </Col>
    </Row>
  </Container>
);

export default UserProfileLite;
