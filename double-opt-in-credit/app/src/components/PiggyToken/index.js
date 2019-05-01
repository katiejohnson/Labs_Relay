import React, { Component } from "react"
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//components
import ExpansionPanel from '@material-ui/core/ExpansionPanel'
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary'
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'

import AddressItems from "../ListItems/AddressItems"
import AuctionItems from "../ListItems/AuctionItems"
import UintItems from "../ListItems/UintItems"
import BoolItems from "../ListItems/BoolItems"

import web3 from 'web3'

const blockDays = web3.utils.toBN(5760)
const blockHours = web3.utils.toBN(240) // 4 blocks per minute * 60 minutes per hour

let addressValues, uintValues, boolValues, auctionValues

let bkgdColor = {
  backgroundColor: '#FFCBCB'
}

class PiggyToken extends Component {
  constructor(props, context) {
    super(props)

    this.contracts = context.drizzle.contracts
    this.drizzle = context.drizzle

    this.handleExpand = this.handleExpand.bind(this)

    this.state = {
      dataKey: '0',
    }
  }

  componentDidMount() {

  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {

  }

  groomID(id) {
    return id.slice(id.lastIndexOf("0")+1)
  }

  groomPrice(price) {
    let str = price.toString()
    return `$` + str.slice(0, str.length-2) + `.` + str.slice(-2)
  }

  groomBlocks(blocks) {
    let expiry = web3.utils.toBN(blocks)
    let currentBlock = web3.utils.toBN(this.props.block)

    let blockDelta = expiry.sub(currentBlock)
    if (blockDelta.isNeg()) {
      return "expired"
    } else if (blockDelta.gte(blockDays)) {
        let days = blockDelta.div(blockDays)
        let hours = days.mul(blockDays).sub(blockDelta).abs().div(blockHours)
        return days.toString() + `d:` + hours.toString() + `hrs`
    } else if (blockDelta.lt(blockDays) && blockDelta.gte(blockHours)) {
        let hours = (blockDays).sub(blockDelta).div(blockHours)
        return `0d:` + hours.toString() + `hrs`
    } else if (blockDelta.gt(web3.utils.toBN('0')) && blockDelta.lt(blockHours)) {
        return `<1hr`
    } else if (blockDelta.isZero()) {
        return `expiring now`
    }
     return 'no data'
  }

  handleExpand = (evt, expanded) => {

    if (expanded) {
      let piggyId = this.groomID(this.props.piggy)
      this.contracts.SmartPiggies.methods.getDetails(piggyId).call()
      .then(result => {
        if (result.length === 3) {
          addressValues = <AddressItems item={result[0]} />
          uintValues = <UintItems item={result[1]} />
          boolValues = <BoolItems item={result[2]} />
        }
      })
      this.contracts.SmartPiggies.methods.getAuctionDetails(piggyId).call()
      .then(result => {
        if (result.length === 8) {
          auctionValues = <AuctionItems item={result} />
        }
      })
    }

  }

  render() {
    //console.log(this.state.piggyDetailMap)
    //let groomedId = this.groomID(this.props.piggy)
    //console.log(this.props.SmartPiggies.getDetails[this.state.dataKey])
    //console.log(this.state.dataKey)
    return (
      <div>
        <ExpansionPanel onChange={this.handleExpand} >
          <ExpansionPanelSummary>
              <Grid container spacing={0}>
                <Grid item xs={2}>
                  piggy: {this.groomID(this.props.piggy)}
                </Grid>

                <Grid item xs={2}>
                  Underlying: {this.props.asset}
                </Grid>

                <Grid item xs={2}>
                  Strike: {this.groomPrice(this.props.strike)}
                </Grid>

                <Grid item xs={2}>
                  Expiry: {this.groomBlocks(this.props.expiry)}
                </Grid>

                <Grid item xs={2}>
                  URL: {this.props.url}
                </Grid>

                <Grid item xs={2}>
                  On Auction: {this.props.auction.toString()}
                </Grid>
              </Grid>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails>
              {addressValues}
              {uintValues}
              {boolValues}
              {auctionValues}
          </ExpansionPanelDetails>
        </ExpansionPanel>
        <Divider />
      </div>
    )
  }
}

PiggyToken.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    SmartPiggies: state.contracts.SmartPiggies
  }
}

export default drizzleConnect(PiggyToken, mapStateToProps);
