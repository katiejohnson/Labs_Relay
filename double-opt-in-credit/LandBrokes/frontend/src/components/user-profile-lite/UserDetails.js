import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardHeader,
  Button,
  ListGroup,
  ListGroupItem,
  Progress
} from "shards-react";
import Web3 from 'web3';

class UserDetails extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      userdata: {}
    }
  }

  componentDidMount = () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
    let metaaccount
    web3.eth.getAccounts().then( (x) => {
      console.log(x) 
      this.setState({userdata: {name: x[0]}})
    }
    );
    
    console.log(metaaccount);
    
    
  }

  render(){
    return (
      <Card small className="mb-4 pt-3">
        <CardHeader className="border-bottom text-center">
          <div className="mb-3 mx-auto">
            <img
              className="rounded-circle"
              src={this.state.userdata.avatar}
              alt={this.state.userdata.name}
              width="110"
            />
          </div>
          <h4 className="mb-0">{this.state.userdata.name}</h4>
          {/* <h4 className="mb-0">{this.state.userdata.name}</h4> */}
          <span className="text-muted d-block mb-2">{this.state.userdata.jobTitle}</span>
          <Button pill outline size="sm" className="mb-2">
            <i className="material-icons mr-1">person_add</i> Follow
          </Button>
        </CardHeader>
        <ListGroup flush>
          <ListGroupItem className="px-4">
            <div className="progress-wrapper">
              <strong className="text-muted d-block mb-2">
                {this.state.userdata.performanceReportTitle}
              </strong>
              <Progress
                className="progress-sm"
                value={this.state.userdata.performanceReportValue}
              >
                <span className="progress-value">
                  {this.state.userdata.performanceReportValue}%
                </span>
              </Progress>
            </div>
          </ListGroupItem>
          <ListGroupItem className="p-4">
            <strong className="text-muted d-block mb-2">
              {this.state.userdata.metaTitle}
            </strong>
            <span>{this.state.userdata.metaValue}</span>
          </ListGroupItem>
        </ListGroup>
      </Card>
    );
  }
}
// const UserDetails = ({ userDetails }) => {
//    console.log(userDetails);
   
//    }

UserDetails.propTypes = {
  /**
   * The user details object.
   */
  userDetails: PropTypes.object
};

UserDetails.defaultProps = {
  userDetails: {
    name: "John Doe",
    avatar: require("./../../images/avatars/0.jpg"),
    jobTitle: "Project Manager",
    performanceReportTitle: "Workload",
    performanceReportValue: 74,
    metaTitle: "Description",
    metaValue:
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio eaque, quidem, commodi soluta qui quae minima obcaecati quod dolorum sint alias, possimus illum assumenda eligendi cumque?"
  }
};

export default UserDetails;
