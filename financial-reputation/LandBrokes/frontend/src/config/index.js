const Config = {
  amountAllowance: process.env.REACT_APP_AMOUNT_ALLOWANCE || '10000000000000000000000000000', //10**(18 + 10)
  tokenTicker: process.env.REACT_APP_TOKEN_TICKER || 'MANA',
  network: process.env.NETWORK || 'development',
  contractsAddress: {
    development: {
      addressManaToken: process.env.ADDRESS_MANA_TOKEN || '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
      decentralandLandProxy: process.env.ADDRESS_DECENTRALAND_PROXY || '0xA57B8a5584442B467b4689F1144D269d096A3daF',
      addressDecentralandMarketplace: process.env.ADDRESS_DECENTRALAND_MARLETPLACE || '0x9e90054F4B6730cffAf1E6f6ea10e1bF9dD26dbb',
      addressDecentralandBid: process.env.ADDRESS_DECENTRALAND_BID || '0x0',
      decentralandMarket: null,
      decentralandApi: null,
      addressBank: process.env.ADDRESS_BANK || '0x6f84742680311CEF5ba42bc10A71a4708b4561d1',
    },
    ropsten: {
      addressManaToken: process.env.ADDRESS_MANA_TOKEN || '0x0',
      decentralandLandProxy: process.env.ADDRESS_DECENTRALAND_PROXY || '0x0',
      addressDecentralandMarketplace: process.env.ADDRESS_DECENTRALAND_MARLETPLACE || '0x0',
      addressDecentralandBid: process.env.ADDRESS_DECENTRALAND_BID || '0x0',
      decentralandMarket: 'https://market.decentraland.zone',
      decentralandApi: 'https://api.decentraland.zone',
      addressBank: process.env.ADDRESS_BANK || '0x0',
    },
    homestead: {
      addressManaToken: process.env.ADDRESS_MANA_TOKEN || '0x0',
      decentralandLandProxy: process.env.ADDRESS_DECENTRALAND_PROXY || '0x0',
      addressDecentralandMarketplace: process.env.ADDRESS_DECENTRALAND_MARLETPLACE || '0x0',
      addressDecentralandBid: process.env.ADDRESS_DECENTRALAND_BID || '0x0',
      decentralandMarket: '',
      decentralandApi: '',
      addressBank: process.env.ADDRESS_BANK || '0x0',
    }
  }
};

export default Config;
