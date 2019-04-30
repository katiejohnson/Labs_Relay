import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Container, Row, Col, Card, CardHeader, CardBody } from "shards-react";
import * as Ethers from 'ethers';

import { allowMana, invest, withdraw } from "../redux/actions";

import PageTitle from "./../components/common/PageTitle";
import SmallStats from "./../components/common/SmallStats";
// import Cards from 'react-credit-cards';

class Overview extends React.Component {

  render() {

    const {
      smallStats,
      address,
      balanceMana,
      balanceInvested,
      allowanceMana,
      allowMana,
      invest,
      withdraw
    } = this.props;

    return (
      <Container fluid className="main-content-container px-4">
        {/* Page Header */}
        <Row noGutters className="page-header py-4">
          <PageTitle title="Investment Overview" subtitle="Dashboard" className="text-sm-left mb-3" />
        </Row>
        {/* Small Stats Blocks */}
        <Row>
          {smallStats.map((stats, idx) => (
            <Col className="col-lg mb-4" key={idx} {...stats.attrs}>
              <SmallStats
                id={`small-stats-${idx}`}
                variation="1"
                chartData={stats.datasets}
                chartLabels={stats.chartLabels}
                label={stats.label}
                value={stats.value}
                percentage={stats.percentage}
                increase={stats.increase}
                decrease={stats.decrease}
              />
            </Col>
          ))}
        </Row>

        {/*<Row noGutters className="mb-2">*/}
        {/*  <strong>Address: { address } Balance mana: { Ethers.utils.formatEther(balanceMana) } Balance Invested: { Ethers.utils.formatEther(balanceInvested) } allowanceMana: { Ethers.utils.formatEther(allowanceMana) } </strong>*/}
        {/*</Row>*/}

        <Row className="mb-2">
          <Col lg="12">

          </Col>

          <Col className="mb-4">
          </Col>
          <Col className="mb-4">
          </Col>
          <Col className="mb-4">
          </Col>
          <Col className="mb-4">
          </Col>
          <Col className="mb-4">
            {/*{*/}
            {/*  balanceInvested !== '0' &&*/}
            {/*  <button*/}
            {/*    onClick={withdraw}*/}
            {/*    className="bg-success text-white text-center rounded p-3"*/}
            {/*    style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>*/}
            {/*    Withdraw*/}
            {/*  </button>*/}
            {/*}*/}
          </Col>
          <Col className="mb-4">
            {/*{*/}
            {/*  allowanceMana === '0' &&*/}
            {/*  <button*/}
            {/*    onClick={allowMana}*/}
            {/*    className="bg-success text-white text-center rounded p-3"*/}
            {/*    style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>*/}
            {/*    Allow bank transfer mana*/}
            {/*  </button>*/}
            {/*}*/}
            {/*{*/}
            {/*  allowanceMana !== '0' &&*/}
            {/*  <button*/}
            {/*    onClick={invest}*/}
            {/*    className="bg-success text-white text-center rounded p-3"*/}
            {/*    style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>*/}
            {/*    Invest*/}
            {/*  </button>*/}
            {/*}*/}
            <button
              // onClick={invest}
              className="bg-success text-white text-center rounded p-3"
              style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>
              Invest
            </button>
          </Col>
        </Row>
        <Row>
          <Col>
            <Card small className="mb-4">
              <CardHeader className="border-bottom">
                <h6 className="m-0">Land Details</h6>
              </CardHeader>
              <CardBody className="p-0 pb-3">
                <table className="table mb-0">
                  <thead className="bg-light">
                  <tr>
                    <th scope="col" className="border-0">
                      #
                    </th>
                    <th scope="col" className="border-0">
                      Coordinates
                    </th>
                    <th scope="col" className="border-0">
                      Closest District
                    </th>
                    <th scope="col" className="border-0">
                      Distance to Road
                    </th>
                    <th scope="col" className="border-0">
                      Percentage Owned
                    </th>
                    <th scope="col" className="border-0">
                      Initial Investment
                    </th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr>
                    <td>1</td>
                    <td>104, 34</td>
                    <td>Dragon City</td>
                    <td>4</td>
                    <td>43</td>
                    <td>488</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>106, 39</td>
                    <td>Dragon City</td>
                    <td>5</td>
                    <td>13</td>
                    <td>300</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>58, 79</td>
                    <td>Aetheria</td>
                    <td>3</td>
                    <td>4</td>
                    <td>179</td>
                  </tr>
                  <tr>
                    <td>4</td>
                    <td>59, 67</td>
                    <td>Aetheria</td>
                    <td>7</td>
                    <td>19</td>
                    <td>603</td>
                  </tr>
                  </tbody>
                </table>
              </CardBody>
              {/* <Cards
              number={FormInput.number.value}
              name={FormInput.name.value}
              expiry={FormInput.expiry.value}
              cvc={FormInput.cvc.value}
              // focused={state.focused}
              >
              </Cards> */}
            </Card>
          </Col>
        </Row>
      </Container>
    )
  }
}

Overview.propTypes = {
  /**
   * The small stats dataset.
   */
  smallStats: PropTypes.array
};

Overview.defaultProps = {
  smallStats: [
    {
      label: "Total Land",
      value: "5",
      percentage: null,
      increase: true,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "6", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(0, 184, 216, 0.1)",
          borderColor: "rgb(0, 184, 216)",
          data: [1, 2, 1, 3, 5, 4, 7]
        }
      ]
    },
    {
      label: "Bank Balance",
      value: "182 MANA",
      percentage: null,
      increase: true,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "6", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(23,198,113,0.1)",
          borderColor: "rgb(23,198,113)",
          data: [1, 2, 3, 3, 3, 4, 4]
        }
      ]
    },
    {
      label: "Currently Invested",
      value: "1,570",
      percentage: null,
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,180,0,0.1)",
          borderColor: "rgb(255,180,0)",
          data: [2, 3, 3, 3, 4, 3, 3]
        }
      ]
    }
    /*{
      label: "New Customers",
      value: "29",
      percentage: "2.71%",
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgba(255,65,105,0.1)",
          borderColor: "rgb(255,65,105)",
          data: [1, 7, 1, 3, 1, 4, 8]
        }
      ]
    },
    {
      label: "Subscribers",
      value: "17,281",
      percentage: "2.4%",
      increase: false,
      decrease: true,
      chartLabels: [null, null, null, null, null, null, null],
      attrs: { md: "4", sm: "6" },
      datasets: [
        {
          label: "Today",
          fill: "start",
          borderWidth: 1.5,
          backgroundColor: "rgb(0,123,255,0.1)",
          borderColor: "rgb(0,123,255)",
          data: [3, 2, 3, 2, 4, 5, 4]
        }
      ]
    }*/
  ]
};

const mapStateToProps = state => {
  return {
    address: state.account.address,
    balanceMana: state.account.balanceMana,
    balanceInvested: state.account.balanceInvested,
    allowanceMana: state.account.allowanceMana
  };
};

export default connect(mapStateToProps, {
  allowMana,
  invest,
  withdraw
})(Overview);
