var Debt = artifacts.require("./Debt.sol");

module.exports = function(deployer) {
  deployer.deploy(Debt);
};
