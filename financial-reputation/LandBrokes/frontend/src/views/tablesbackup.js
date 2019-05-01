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

class Tablesbackup extends React.Component {
   constructor(props){
       super(props)
       this.state = {
        smallStats: [
            {
              label: "Credit Score",
              value: "1",
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
       }
   }

    render() {
        return (
            <Container fluid className="main-content-container px-4">
            {/* Page Header */}
            <Row noGutters className="page-header py-4">
            <Col>
              {Tablesbackup.smallStats.map((stats, idx) => (
                <Col className="col-lg mb-4" key={idx} {...stats.attrs}>
                  <SmallStats
                    id={`small-stats-${idx}`}
                    variation="1"
                    chartData={this.state.stats.datasets}
                    chartLabels={this.state.stats.chartLabels}
                    label={this.state.stats.label}
                    value={this.state.stats.value}
                    percentage={this.state.stats.percentage}
                    increase={this.state.stats.increase}
                    decrease={this.state.stats.decrease}
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
              <PageTitle sm="4" title="Add New Post" subtitle="Blog Posts" className="text-sm-left" />

                   <Col className="mb-4">
              <div
                className="bg-success text-white text-center rounded p-3"
                style={{ boxShadow: "inset 0 0 5px rgba(0,0,0,.2)" }}>
                Invest
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
                            First Name
                          </th>
                          <th scope="col" className="border-0">
                            Last Name
                          </th>
                          <th scope="col" className="border-0">
                            Country
                          </th>
                          <th scope="col" className="border-0">
                            City
                          </th>
                          <th scope="col" className="border-0">
                            Phone
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Ali</td>
                          <td>Kerry</td>
                          <td>Russian Federation</td>
                          <td>Gdańsk</td>
                          <td>107-0339</td>
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Clark</td>
                          <td>Angela</td>
                          <td>Estonia</td>
                          <td>Borghetto di Vara</td>
                          <td>1-660-850-1647</td>
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Jerry</td>
                          <td>Nathan</td>
                          <td>Cyprus</td>
                          <td>Braunau am Inn</td>
                          <td>214-4225</td>
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Colt</td>
                          <td>Angela</td>
                          <td>Liberia</td>
                          <td>Bad Hersfeld</td>
                          <td>1-848-473-7416</td>
                        </tr>
                      </tbody>
                    </table>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        );
    }
}



Tablesbackup.propTypes = {
  /**
   * The small stats dataset.
   */
  smallStats: PropTypes.array
};

Tablesbackup.defaultProps = {
  smallStats: [
    {
      label: "Credit Score",
      value: "1",
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


export default Tablesbackup;
