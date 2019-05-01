const SmartPiggies = artifacts.require("SmartPiggies");

module.exports = function(deployer) {
  deployer.deploy(SmartPiggies);
};
