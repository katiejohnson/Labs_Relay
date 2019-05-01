require('../config');

const Utils = require('./modules/utils');
const Bank = require('./modules/bank');

(async () => {

  const bank = new Bank();
  await bank.init();

  await bank.checkBidForLands();

})().catch(error => Utils.logger.error('Global error', { error }) );
