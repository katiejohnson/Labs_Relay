import { Component } from "react";

//TODO: If account changes delete session
//TODO: if account not equal logged delete session
class CheckAccountChanges extends Component {
  constructor(props) {
    super(props);
    this.checkAccount = this.checkAccount.bind(this);
    this.state = {
      currentAccount: props.loggedAccount
    };
    this.timerId = 0;
  }

  componentDidMount() {
    this.timerId = setInterval(this.checkAccount, 1000);
  }

  //Cleans the timer
  componentWillUnmount() {
    clearInterval(this.timerId);
  }

  checkAccount() {
    this.props.drizzle.web3.eth
      .getAccounts()
      .then(result => this.setState({ currentAccount: result }));
    if (this.state.currentAccount != this.props.loggedAccount) {
      window.location.reload();
    }
  }
  render() {
    return null;
  }
}

export default CheckAccountChanges;
