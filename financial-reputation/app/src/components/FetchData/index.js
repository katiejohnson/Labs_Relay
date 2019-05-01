import React, { Component } from "react"
import { drizzleConnect } from 'drizzle-react'
import PropTypes from 'prop-types'

//components
import PiggyToken from "../PiggyToken"

const endpoint = 'https://api.goerli.aleth.io/v1/contracts/0xd847904c84532950bdbe7ed8dd2e8c9ce0a3716d/logEntries'

class FetchData extends Component {
  constructor(props, context) {
    super(props)

    this.hex2a = this.hex2a.bind(this)
    this.fetchPiggies = this.fetchPiggies.bind(this)

    this.state = {
      piggies: [],
      oracles: [],
      auctions: [],
      // see if this is easier with objects than arrays, for indexing purposes
      // keys for all of these should be the PiggyID so they can easily be cross-referenced
      pdict: {},
    }

  }

  hex2a(hexx) {
      var hex = hexx.toString();//force conversion
      var str = '';
      for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
          str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
      return str.trim();
  }

  groomID(id) {
    return id.slice(id.lastIndexOf("0")+1)
  }

  async fetchPiggies() {
    // fetch last 10 records as JSON
    let lten = await fetch(endpoint)
    let ltenjson = await lten.json()
    // parse out token creation events and get whatever data we can get from those
    let tokens = this.state.pdict
    ltenjson.data.map((item) => {
      if (item.attributes.eventDecoded.topic0 === '0xaa2032c3a05e7293eec92b9f41cfe70d5d753b29790a3f2cdeace3d6f5c9b749') {
        tokens[item.attributes.eventDecoded.inputs[1].value] = {
          'writer': item.attributes.eventDecoded.inputs[0].value,
          'strike': parseInt(item.attributes.eventDecoded.inputs[2].value, 16),
          'expiry': parseInt(item.attributes.eventDecoded.inputs[3].value, 16),
          'rfp': item.attributes.eventDecoded.inputs[4].value.slice(-1) === '0' ? false:true,
          'txurl': item.relationships.transaction.links.related,
          'onAuction': false
        }
      }
    })
    // given the transaction creation URLs, find the oracle address specified for each piggy and scrape it for (piggy) API data
    Object.keys(tokens).map(async (item) => {
      let urlToFetch = tokens[item]['txurl']
      let oaddress = await this.scrapePiggyTx(urlToFetch)
      let odata = await this.fetchOracleData(oaddress)
      tokens[item]['oracleAddress'] = oaddress
      tokens[item]['oracleData'] = odata
    })

    this.setState({
      pdict: tokens
    })

    // check for auction events and get auction status
    ltenjson.data.map((item) => {
      if (item.attributes.eventDecoded.topic0 === '0x88a665277b4dcf78a761227e836d2b9c98169b818abf80cb4297114cb71a019f') {
        this.state.pdict[item.attributes.eventDecoded.inputs[1].value]['onAuction'] = true
      }
    })

  } //end fetch block

  async scrapePiggyTx(txurl) {
    // map over txurl values to look up piggy creation transactions
      let ptx = await fetch(txurl)
      let ptxjson = await ptx.json()
      // console.log("something", ptxjson)
      let oracleAddress = ptxjson.data.attributes.msgPayload.inputs[2].value.slice(24)
      return oracleAddress
  }

  async fetchOracleData(oaddress) {
    console.log(oaddress)
    let otx = await fetch('https://api.goerli.aleth.io/v1/contracts/' + oaddress)
    let otxjson = await otx.json()

    let returndata = {}
    if (otxjson.data.attributes.constructorArgs[17] !== undefined) {
      returndata['underlying'] = this.hex2a(otxjson.data.attributes.constructorArgs[10])
      returndata['datasource'] = this.hex2a(otxjson.data.attributes.constructorArgs[8])
      returndata['api'] = this.hex2a(otxjson.data.attributes.constructorArgs[14]) +
        this.hex2a(otxjson.data.attributes.constructorArgs[15]) +
          this.hex2a(otxjson.data.attributes.constructorArgs[16]) +
            this.hex2a(otxjson.data.attributes.constructorArgs[17])
    } else if (otxjson.data.attributes.constructorArgs[16] !== undefined) {
      returndata['underlying'] = this.hex2a(otxjson.data.attributes.constructorArgs[10])
      returndata['datasource'] = this.hex2a(otxjson.data.attributes.constructorArgs[8])
      returndata['api'] = this.hex2a(otxjson.data.attributes.constructorArgs[14]) +
        this.hex2a(otxjson.data.attributes.constructorArgs[15]) +
          this.hex2a(otxjson.data.attributes.constructorArgs[16])
    }

    return returndata
  }

  fetchPiggiesOld() {
    let address = '0'

    fetch(endpoint)
    .then(result => {
      return result.json()
    })
    .then(jsonResult => {
      jsonResult.data.map((item, i) => {
        if (item.attributes.eventDecoded.topic0 === '0xaa2032c3a05e7293eec92b9f41cfe70d5d753b29790a3f2cdeace3d6f5c9b749') {

          fetch(item.relationships.transaction.links.related)
          .then(result => {
            return result.json()
          })
          .then(result => {
            address = result.data.attributes.msgPayload.inputs[2].value.slice(24)
            let oracleEndpoint = 'https://api.goerli.aleth.io/v1/contracts/' + address

            fetch(oracleEndpoint)
            .then(result => {
              return result.json()
            })
            .then(result => {
              let oracleArray = this.state.oracles
              oracleArray.push(
                {
                  piggyId: this.groomID(item.attributes.eventDecoded.inputs[1].value),
                  address: address,
                  underlying: this.hex2a(result.data.attributes.constructorArgs[10]),
                  url: this.hex2a(result.data.attributes.constructorArgs[8]),
                }
              )
              this.setState({
                oracles: oracleArray
              })
            })

          })

          let piggyArray = this.state.piggies
          piggyArray.push(
            {
              index: i,
              id: item.id,
              topic: item.attributes.eventDecoded.topic0,
              writer: item.attributes.eventDecoded.inputs[0].value,
              piggyId: item.attributes.eventDecoded.inputs[1].value,
              strike: parseInt(item.attributes.eventDecoded.inputs[2].value, 16),
              expiry: parseInt(item.attributes.eventDecoded.inputs[3].value, 16),
              rfp: item.attributes.eventDecoded.inputs[4].value,
              txUrl: item.relationships.transaction.links.related
            }
          )
          this.setState({
            piggies: piggyArray
          })

        } //end of log check for create event topic0

        if (item.attributes.eventDecoded.topic0 === '0x88a665277b4dcf78a761227e836d2b9c98169b818abf80cb4297114cb71a019f') {
          let auctionArray = this.state.auctions
          auctionArray.push(
            {
              index: i,
              id: item.id,
              topic: item.attributes.eventDecoded.topic0,
              piggyId: this.groomID(item.attributes.eventDecoded.inputs[1].value)
            }
          )
          this.setState({
            auctions: auctionArray
          })
        } //end of log check for auction event topic0

        return (null) //return for the map

        })
      })
  }

  componentDidMount() {
    this.fetchPiggies()

  }

  componentDidUpdate(prevProps, prevState) {

  }

  componentWillUnmount() {

  }

  render() {
    //console.log(this.state.pdict)
    let tokenKeys = Object.keys(this.state.pdict)
    let tokens
    let piggy = '', asset = '', strike = '', expiry = '', url = ''
    let onAuction = false
    if (tokenKeys.length > 0) {
      tokens = tokenKeys.map((item) => {
        if (this.state.pdict[item].oracleData !== undefined) {
          piggy = item
          asset = this.state.pdict[item].oracleData.underlying
          url = this.state.pdict[item].oracleData.datasource
          strike = this.state.pdict[item].strike
          expiry = this.state.pdict[item].expiry
          onAuction = this.state.pdict[item].onAuction
        }
        if (this.props.onlyOnAuction && onAuction) {
          return <PiggyToken
                  key={item}
                  block={this.props.block}
                  piggy={piggy}
                  asset={asset}
                  strike={strike}
                  expiry={expiry}
                  url={url}
                  auction={onAuction}
              />
        } else if (!this.props.onlyOnAuction) {
          return <PiggyToken
                  key={item}
                  block={this.props.block}
                  piggy={piggy}
                  asset={asset}
                  strike={strike}
                  expiry={expiry}
                  url={url}
                  auction={onAuction}
              />
        }
      })
    }
    //console.log(this.state.pdict)
    return (
      <div>
        {tokens}
      </div>
    )
  }
}

FetchData.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    SmartPiggies: state.contracts.SmartPiggies
  }
}

export default drizzleConnect(FetchData, mapStateToProps);
