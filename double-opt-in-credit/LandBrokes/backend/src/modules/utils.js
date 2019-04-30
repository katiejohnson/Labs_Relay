const fetch = require('node-fetch');

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, prettyPrint } = format;

const logger = createLogger({
  format: combine(
    timestamp(),
    prettyPrint()
  ),
  transports: [ new transports.Console() ]
});

const Utils = {
  fetch,
  logger
};

module.exports = Utils;
