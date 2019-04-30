require('dotenv').config();

const Bank = artifacts.require('Bank');
const VotingCredit = artifacts.require('VotingCredit');
const CreditScoring = artifacts.require('CreditScoring');

const manaTicker = 'MANA';
const maxLandOwners = 30;
const maxLandSplits = 10000;
const maxBidDuration = 60 * 60 * 24 * 180; //180 days
const noActionCancelAfter = 60 * 60 * 24 * 60; //60 days

const addressManaToken = '0xCfEB869F69431e42cdB54A4F4f105C19C080A601';
const addressMarketplace = '0x9e90054F4B6730cffAf1E6f6ea10e1bF9dD26dbb';
const addressLandToken = '0xA57B8a5584442B467b4689F1144D269d096A3daF';
const addressLandProxy = '0xA57B8a5584442B467b4689F1144D269d096A3daF';
const addressDecentralandBid = '0x0000000000000000000000000000000000000000';

const proposalDuration = 60 * 60 * 24 * 60; //60 days

const _maxRequestAvailability = 60 * 60 * 24 * 30;
const _minCancelRequestDelay = 60 * 60 * 24 * 7;
const _MAX_BORROWED_CREDIT_POINTS = 50;
const _MAX_LENT_CREDIT_POINTS = 50;
const _WAIT_FOR_COLLATERAL_RETREIVAL = 60 * 60 * 24 * 7;
const _BORROWED_KEEPING_TIME_LIMIT = 60 * 60 * 24 * 90;

module.exports = async function (deployer, network, accounts) {

  if(network === 'development'){

    const creditScoringParams = [
      _maxRequestAvailability,
      _minCancelRequestDelay,
      _MAX_BORROWED_CREDIT_POINTS,
      _MAX_LENT_CREDIT_POINTS,
      _WAIT_FOR_COLLATERAL_RETREIVAL,
      _BORROWED_KEEPING_TIME_LIMIT
    ];

    const bankParams = [
      manaTicker,
      maxLandOwners,
      maxLandSplits,
      maxBidDuration,
      noActionCancelAfter,
      addressManaToken,
      addressMarketplace,
      addressLandToken,
      addressLandProxy,
      addressDecentralandBid,
    ];

    await deployer.deploy(Bank, ...bankParams, { from: accounts[0] });
    await deployer.deploy(VotingCredit, proposalDuration, {from: accounts[0]});
    await deployer.deploy(CreditScoring, ...creditScoringParams, { from: accounts[0] });

  } else if (network === 'ropsten') {}

};
