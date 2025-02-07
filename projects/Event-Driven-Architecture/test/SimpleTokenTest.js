const SimpleToken = artifacts.require("SimpleToken");
import { TronWeb } from "tronweb"

let simpleToken;
contract("SimpleToken", accounts => {

    before(async () => {
        simpleToken = await SimpleToken.deployed();
    });

    it("deployer should have same balance as initial supply", async () => {
        const balance = await simpleToken.balances(accounts[0]);
        const totalSupply = await simpleToken.totalSupply();
        assert.equal(balance.toNumber(), totalSupply);
    });

    it("should transfer tokens", async () => {
        const balanceBefore = await simpleToken.balances(accounts[0]);
        await simpleToken.transfer(accounts[1], 100);
        const balanceAfter = await simpleToken.balances(accounts[0]);
        assert.equal(balanceBefore.toNumber() - 100, balanceAfter.toNumber());
    });

    it("should not allow transfer more tokens than balance", async () => {
        const balanceBefore = await simpleToken.balances(accounts[0]);
        await simpleToken.transfer(accounts[1], balanceBefore.toNumber() + 1);
        const balanceAfter = await simpleToken.balances(accounts[0]);
        assert.equal(balanceBefore.toNumber(), balanceAfter.toNumber());
    });

});