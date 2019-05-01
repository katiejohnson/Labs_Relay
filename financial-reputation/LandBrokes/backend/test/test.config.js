const path = require('path');
const chaiAsPromised = require('chai-as-promised');

global.srcDir = path.resolve(path.join(__dirname, '../src') );

global.chai = require('chai');
global.expect = global.chai.expect;
global.chai.use(chaiAsPromised);
global.createSandbox = require('sinon').createSandbox;


