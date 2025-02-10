const ManagedContractFactory = artifacts.require("./ManagedContractFactory.sol");

module.exports = function(deployer) {
  deployer.deploy(ManagedContractFactory);
};
