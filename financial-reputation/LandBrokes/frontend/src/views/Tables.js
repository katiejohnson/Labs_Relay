import React from "react";
import { Container, Row, Col, Card, CardHeader, CardBody } from "shards-react";
import PropTypes from "prop-types";
import PageTitle from "../components/common/PageTitle";
import SmallStats from "./../components/common/SmallStats";
import Cards from 'react-credit-cards';



import {
  formatCreditCardNumber,
  formatCVC,
  formatExpirationDate,
  formatFormData,
} from './utils';


const Tables = ( {smallStats} ) => (
  <Container fluid className="main-content-container px-4">
    {/* Page Header */}
    <Row noGutters className="page-header py-4">
    <Col>
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
      </Col>
      <Col>
      <Card
            name="John Smith"
            number="5555 4444 3333 1111"
            expiry="10/20"
            cvc="737"
          />
      </Col>
    </Row>
    <Row noGutters className="page-header py-4">
      <PageTitle sm="4" title="Credit Scoring Proposals" subtitle="Governance" className="text-sm-left" />

           <Col className="mb-4">
      <div
        className="bg-success text-white text-center rounded p-3"
        style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>
        Propose
      </div>
    </Col>
    </Row>


    {/* Default Light Table */}
    <Row>
      <Col>
        <Card small className="mb-4">
          <CardHeader className="border-bottom">
            <h6 className="m-0">Proposals</h6>
          </CardHeader>
          <CardBody className="p-0 pb-3">
            <table className="table mb-0">
              <thead className="bg-light">
                <tr>
                  <th scope="col" className="border-0">
                    #
                  </th>
                  <th scope="col" className="border-0">
                    Type
                  </th>
                  <th scope="col" className="border-0">
                    Parameter Name
                  </th>
                  <th scope="col" className="border-0">
                    Parameter Level
                  </th>
                  <th scope="col" className="border-0">
                    IPFS
                  </th>
                  <th scope="col" className="border-0">
                    Creator
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1</td>
                  <td>Param</td>
                  <td>Investment History</td>
                  <td>0</td>
                  <td>IPFS LINK</td>
                  <td>0x5581...e490</td>
                </tr>
                <tr>
                  <td>2</td>
                  <td>Formula</td>
                  <td>-</td>
                  <td>-</td>
                  <td>IPFS LINK</td>
                  <td>0x5581...e490</td>
                </tr>
                <tr>
                  <td>3</td>
                  <td>Param</td>
                  <td>Outstanding Debt</td>
                  <td>2</td>
                  <td>IPFS LINK</td>
                  <td>0x5581...e490</td>
                </tr>
                <tr>
                  <td>4</td>
                  <td>Param</td>
                  <td>Times Defaulted</td>
                  <td>1</td>
                  <td>IPFS LINK</td>
                  <td>0x5581...e490</td>
                </tr>
              </tbody>
            </table>
          </CardBody>
        </Card>
      </Col>
    </Row>


  </Container>
);

Tables.propTypes = {
  /**
   * The small stats dataset.
   */
  smallStats: PropTypes.array
};

Tables.defaultProps = {
  smallStats: [
    {
      label: "Credit Score",
      value: "0",
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
    }
  ]
};


export default Tables;
