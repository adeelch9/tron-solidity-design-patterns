const SimpleToken = artifacts.require("SimpleToken");

contract("SimpleToken", accounts => {
    let simpleToken;
    const initialSupply = 1000000;
    const owner = accounts;
    const recipient = accounts;

    before(async () => {
        simpleToken = await SimpleToken.new(initialSupply);
    });

    describe("Transfer functionality and event emission", () => {
        it("should transfer tokens and emit Transfer event correctly", async () => {
            const transferAmount = 100;

            // Get initial balances
            const initialSenderBalance = await simpleToken.balances(owner);
            const initialRecipientBalance = await simpleToken.balances(recipient);

            // Execute transfer
            const result = await simpleToken.transfer(recipient, transferAmount, { from: owner });

            // Check if Transfer event was emitted
            assert.equal(result.logs.length, 1, "should emit one event");
            
            const transferEvent = result.logs[0];
            assert.equal(transferEvent.event, "Transfer", "should be Transfer event");
            assert.equal(transferEvent.args.from, owner, "sender should be owner");
            assert.equal(transferEvent.args.to, recipient, "recipient should match");
            assert.equal(transferEvent.args.value.toNumber(), transferAmount, "transfer amount should match");

            // Verify balances
            const finalSenderBalance = await simpleToken.balances(owner);
            const finalRecipientBalance = await simpleToken.balances(recipient);

            assert.equal(
                finalSenderBalance.toNumber(),
                initialSenderBalance.toNumber() - transferAmount,
                "sender balance should be reduced"
            );
            assert.equal(
                finalRecipientBalance.toNumber(),
                initialRecipientBalance.toNumber() + transferAmount,
                "recipient balance should be increased"
            );
        });

        it("should fail when trying to transfer more than balance", async () => {
            const excessAmount = initialSupply + 1;
            
            try {
                await simpleToken.transfer(recipient, excessAmount, { from: owner });
                assert.fail("The transfer should have thrown an error");
            } catch (error) {
                assert.include(
                    error.message,
                    "Insufficient balance",
                    "Should include insufficient balance message"
                );
            }
        });

        // Event listening test
        it("should be able to listen to Transfer events", async () => {
            const transferAmount = 50;
            
            // Create promise to wait for event
            const eventPromise = new Promise((resolve, reject) => {
                simpleToken.Transfer().once('data', (event) => {
                    resolve(event);
                });
            });

            // Execute transfer
            await simpleToken.transfer(recipient, transferAmount, { from: owner });

            // Wait for event and verify its data
            const event = await eventPromise;
            assert.equal(event.from, owner, "Event sender should be owner");
            assert.equal(event.to, recipient, "Event recipient should match");
            assert.equal(event.value.toNumber(), transferAmount, "Event transfer amount should match");
        });
    });
});