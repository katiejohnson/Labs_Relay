const assert = require('assert');
const cloneDeep = require('lodash.clonedeep');
const Decimal = require('decimal.js');
const Ethers = require('ethers');

const Config = require('../../config');
const Utils = require('./utils');
const BankContractABI = require('../../../chain/bankContracts/build/contracts/IBank').abi; // eslint-disable-line node/no-unpublished-require

//https://api.decentraland.org/v1/parcels/145/-49
//With bids:
//https://api.decentraland.org/v1/parcels/37/123
//https://api.decentraland.org/v1/parcels/37/123/bids
// buy on 0x5424912699DABaa5F2998750c1c66E73D67AD219

class Bank {

  constructor() {

    this.initilized = false;

  }

  async init(){

    assert(!this.initilized, 'already_initialized');

    this.provider = Config.network === 'development' ? new Ethers.providers.JsonRpcProvider('http://localhost:8545') : new Ethers.providers.InfuraProvider(Config.network, Config.infuraApiKey);
    this.wallet = new Ethers.Wallet(Config.privateKey, this.provider);
    this.bankContract = new Ethers.Contract(Config.contractsAddress[Config.network].addressBank, BankContractABI, this.wallet);
    this.initilized = true;

  }

  static async _findBestBidForLands(){

    const res = await Utils.fetch(`${Config.contractsAddress[Config.network].decentralandApi}/v1/marketplace?limit=12&offset=0&status=open&asset_type=parcel&sort_by=created_at&sort_order=desc`).then(res => res.json() );

    return res.data.assets.map(land => ({
      id: land.id,
      price: land.publication.price
    }) ); // TODO FILTER/order rules

  }

  static _selectInvestors(investorsData, price){

    const investorsDataUpdated = cloneDeep(investorsData);
    const selectedInvestorsData = [];
    let investorsBalance = Decimal(0);

    for(let j = 0; j < investorsDataUpdated.length; j++){

      const investorData = investorsDataUpdated[j];

      if(investorsBalance.add(investorData.balance).gte(price) ){

        const amountNeeded = Decimal(price).sub(investorsBalance);
        investorsBalance = investorsBalance.add(amountNeeded);
        selectedInvestorsData.push(Object.assign({}, investorData, { balance: amountNeeded.toString() }) );
        investorData.balance = Decimal(investorData.balance).sub(amountNeeded).toString();

        break;

      } else {

        investorsBalance = investorsBalance.add(investorData.balance);
        selectedInvestorsData.push(Object.assign({}, investorData) );
        investorData.balance = '0';

      }

    }

    if(!investorsBalance.eq(price) ){

      return false;

    }

    return {
      selectedInvestorsData,
      investorsDataUpdated: investorsDataUpdated.filter(investorDataUpdated => !Decimal(investorDataUpdated.balance).eq(0) )
    };

  }

  async _checkBuyLand(land, investorsData){

    const { selectedInvestorsData, investorsDataUpdated }  = Bank._selectInvestors(investorsData, land.price);

    if(!selectedInvestorsData){

      Utils.logger.error('cannot_select_investors', {
        investorsData,
        land
      });

      throw new Error('cannot_select_investors');

    }

    Utils.logger.info('Find investors for land', {
      service: 'bank',
      selectedInvestorsData,
      landId: land.id,
      price: land.price
    });

    await this.directBuyLand(land.id, selectedInvestorsData);

    return { investorsDataUpdated };

  }

  async checkBidForLands(){

    assert(this.initilized, 'not_initialized');

    const bestLands = await Bank._findBestBidForLands();
    const splitInvestorsData = await this.bankContract.getSplitInvestorsData();
    let investorsData = splitInvestorsData[0].map( (address, i) => ({ address, balance: splitInvestorsData[1][i].toString() }) );

    const totalFunds = investorsData.reduce( (acc, investorData) => acc.add(investorData.balance), Decimal(0) );
    let remainFunds = totalFunds;

    for(let i = 0; i < bestLands.length; i++){

      const land = bestLands[i];

      if(remainFunds.lt(land.price) ){

        break;

      }

      try {

        const { investorsDataUpdated } = await this._checkBuyLand(land, investorsData);
        investorsData = investorsDataUpdated;
        remainFunds = remainFunds.sub(land.price);

      } catch (error) {

        Utils.logger.error('Check bid land error', {
          service: 'bank',
          error,
          landId: land.id,
          price: land.price,
          remainFunds,
          totalFunds
        });

      }

    }

  }

  async directBuyLand(landId, investorsData, investmentType = 'split'){

    assert(this.initilized, 'not_initialized');

    const tx = await this.bankContract.directBuyLand(
      investmentType === 'split' ? 1 : 0,
      landId,
      investorsData.map(investorData => investorData.address),
      investorsData.map(investorData => investorData.balance)
    );

    await tx.wait();

  }

}

module.exports = Bank;
