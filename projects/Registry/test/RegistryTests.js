const Registry = artifacts.require("Registry");
const UserStorage = artifacts.require("UserStorage");
const UserLogic = artifacts.require("UserLogic");
import { TronWeb } from "tronweb";

contract("Registry", accounts => {
  let registry;
  let userStorage;
  let userLogic;
  let owner = accounts[0];

  beforeEach(async () => {
    registry = await Registry.deployed();
    console.log("Registry deployed at:", registry.address);
    userStorage = await UserStorage.deployed();
    console.log("UserStorage deployed at:", userStorage.address);
    userLogic = await UserLogic.deployed();
    console.log("UserLogic deployed at:", userLogic.address);

    //Register the UserStorage contract in the Registry
    await registry.setContract(TronWeb.sha3("UserStorage"), userStorage.address);
  });

  it("should add and retrieve a user", async () => {

    const userName = "Alice";
    await new Promise(resolve => setTimeout(resolve, 10000));
    await userLogic.addUser(accounts[1], userName);
    const retrievedUserName = await userLogic.getUser(accounts[1]);
    assert.equal(retrievedUserName, userName);
  });

  it("Should allow updating the UserStorage contract", async () => {
    const userName = "Bob";
    const newUserStorage = await UserStorage.new();
    await registry.setContract(TronWeb.sha3("UserStorage"), newUserStorage.address);
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Add a user
    await userLogic.addUser(accounts[2], userName);
    
    // Retrieve the user's name
    const retrievedUserName = await userLogic.getUser(accounts[2]);
    assert.equal(retrievedUserName, userName);
  });
});