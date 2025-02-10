const Registry = artifacts.require("./Registry.sol");
const UserStorage = artifacts.require("./UserStorage.sol");
const UserLogic = artifacts.require("./UserLogic.sol");

module.exports = async function(deployer) {
  await deployer.deploy(Registry);
  const registry = await Registry.deployed();

  await deployer.deploy(UserStorage);
  await deployer.deploy(UserLogic, registry.address);
};
