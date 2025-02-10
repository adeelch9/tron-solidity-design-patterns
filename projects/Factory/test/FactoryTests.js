const ManagedContractFactory = artifacts.require("ManagedContractFactory");
const ManagedContract = artifacts.require("ManagedContract");

contract("ManagedContractFactory", accounts => {
  let managedContractFactory;

  beforeEach(async () => {
    managedContractFactory = await ManagedContractFactory.deployed();
  });

  it("deploys a new ManagedContract with the specified value", async () => {
    const initialValue = 42;
    await managedContractFactory.createManagedContract(initialValue);
    const count = await managedContractFactory.getManagedContractsCount();
    assert.equal(1, count.toNumber());
  });

  it("tracks the number of created ManagedContracts", async () => {
    const countBefore = await managedContractFactory.getManagedContractsCount();
    
    await managedContractFactory.createManagedContract(42);
    
    const countAfter = await managedContractFactory.getManagedContractsCount();
    assert.equal(countAfter.toNumber(), countBefore.toNumber() + 1);
  });

  it("provides a list of created ManagedContracts", async () => {    
    const managedContracts = await managedContractFactory.getManagedContracts();
    assert.equal(managedContracts.length, 2);
  });

});