import React, { Component } from 'react'
import { drizzleConnect } from 'drizzle-react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import AppBar from '@material-ui/core/AppBar'
import Card from '@material-ui/core/Card'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

//import components
import FetchData from "../FetchData"


import '../../App.js'

const appBar = {
  backgroundColor: 'default',
  //height: 50,
  display: 'block',
  padding: 10,
}

const toggle = {
  paddingLeft: 10,
}

// current network client is connected to
let activeNetwork

class Home extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts
    this.drizzle = context.drizzle

    this.state = {
      spContractAddress: '',
      activeAccount: '',
      blockNumber: 0,
      network: 0,
      onlyOnAuction: false,
      //datakeys
      dataKeyGetOwnedPiggies: '',
      value: 0,
    }

  }

  componentDidMount() {
    // If Drizzle is initialized (and therefore web3, accounts and contracts), continue.
    if (this.props.drizzleStatus.initialized) {

      // Declare this call to be cached and synchronized. We'll receive the store key for recall.
      let globalDataKeyGetOwnedPiggies = this.contracts.SmartPiggies.methods['getOwnedPiggies'].cacheCall(this.props.accounts[0])

      this.setState({
        dataKeyGetOwnedPiggies: globalDataKeyGetOwnedPiggies,
        //dataKeyGetDetails: globalDataKeyGetDetails,
        network: this.drizzle.web3.givenProvider.networkVersion
      })

      switch (this.state.network) {
        case '1':
          activeNetwork = 'Ethereum'
          break
        case '3':
          activeNetwork = 'Ropsten'
          break
        case '4':
          activeNetwork = 'Rinkeby'
          break
        case '5':
          activeNetwork = 'Goerli'
          break
        default:
          activeNetwork = 'unknown'
      }

      //set block number on load
      this.drizzle.web3.eth.getBlockNumber()
      .then(result => {
        this.setState({
          blockNumber: result
        })
      })
    }

    this.setState({
      spContractAddress: this.contracts.SmartPiggies.address,
      activeAccount: this.props.accounts[0]
    })

    //update current block number every 10 seconds
    this.interval = setInterval(() => {
      this.drizzle.web3.eth.getBlockNumber()
      .then(result => {
        this.setState({
          blockNumber: result
        })
      })
    }, 10000)
  }

  componentDidUpdate(prevProps, prevState) {

    //Update network
    if (this.state.network !== prevState.network) {
      switch (this.state.network) {
        case '1':
          activeNetwork = 'Ethereum'
          break
        case '3':
          activeNetwork = 'Ropsten'
          break
        case '4':
          activeNetwork = 'Rinkeby'
          break
        case '5':
          activeNetwork = 'Goerli'
          break
        default:
          activeNetwork = 'unknown'
      }
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  groomAddress(address) {
    let groomed
    if (address !== '0x0000000000000000000000000000000000000000') {
      groomed = address.slice(0, 6)
      groomed = groomed + "...." + address.slice(-4)
    }
    return groomed
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.checked })
  }

  handleOpenLink = (event, value) => {
    window.open(value, '_blank')
  }

  render() {
    //console.log(this.state.piggyDetailMap)
    let groomedAddress = this.groomAddress(this.state.activeAccount)

    return (
      <div className='App'>
        <AppBar
          style={appBar}
          color="default"
        >
          <table width="100%">
            <tbody>
              <tr>
                <td>Contract: {this.state.spContractAddress}</td>
                <td text-align="right">Block: {this.state.blockNumber}</td>
              </tr>
              <tr>
                <td>User: {groomedAddress}</td>
                <td text-align="right">Network: {activeNetwork}</td>
              </tr>
            </tbody>
          </table>
        </AppBar>
        <div className='Main'>
          <div>
            <Card className='WelcomeBar' style={{backgroundColor: '#FFCBCB'}}>
              <Typography variant='h4' className='WelcomeBar'>Welcome to Amerigo!</Typography>
              <Divider />
              <Typography variant='body1' className='WelcomeBar'>Amerigo is an explorer for SmartPiggies. View available options below, and if you find one you like, buy it!</Typography>
            </Card>
          </div>
          <br></br>
          <Card>
            <FormControlLabel
              style={toggle}
              control={
                <Switch
                  checked={this.state.onlyOnAuction}
                  onChange={this.handleChange('onlyOnAuction')}
                  value='onlyOnAuction'
                  style={{color: '#FFCBCB'}}
                />
              }
              label='Show Only Piggies on Auction'
            />
            <FetchData block={this.state.blockNumber} onlyOnAuction={this.state.onlyOnAuction} />
          </Card>
        </div>
        <div className='Footer'>
            <BottomNavigation
            showLabels
            onChange={this.handleOpenLink}
            style={{backgroundColor: '#FFCBCB'}}
            >
              <BottomNavigationAction label='SmartPiggies' value='https://www.smartpiggies.com'/>
              <BottomNavigationAction label='GitHub' value='https://github.com/smartpiggies'/>
              <BottomNavigationAction label='Twitter' value='https://twitter.com/smart_piggies'/>
            </BottomNavigation>
          </div>
      </div>
    )
  }
}

Home.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    SmartPiggies: state.contracts.SmartPiggies
  }
}

export default withRouter(drizzleConnect(Home, mapStateToProps))
