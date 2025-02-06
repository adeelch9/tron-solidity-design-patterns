const Diamond = artifacts.require("Diamond");
const DiamondLoupeFacet = artifacts.require("DiamondLoupeFacet");
const OwnershipFacet = artifacts.require("OwnershipFacet");
const DiamondCutFacet = artifacts.require("DiamondCutFacet");
const DiamondInit = artifacts.require("DiamondInit");
const { TronWeb } = require("tronweb");
const { ethers } = require("ethers");

const FacetNames = [
    "DiamondLoupeFacet",
    "OwnershipFacet",
    "Test1Facet",
    "Test2Facet",
    // Add other facet names here
];

const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2,
};

// Helper: Get function selectors using ethers
function getSelectors(contract) {
    return contract.abi
        .filter(item => item.type === "function")
        .map(f => ethers.utils.id(ethers.utils.Fragment.from(f).format()).slice(0, 10))
        .filter(selector => selector !== null);
}

// Helper: Encode initialization calldata using ethers
function encodeInitializerFunction(contract, functionName, args = []) {
    // Create a tronweb instance of the contract interface
    const functionSelector = contract.methodInstances[functionName].signature;
    
    // Encode the parameters using tronweb's encodeParams
    if (args.length === 0) {
        return functionSelector;
    }
    
    // Get the parameter types from the ABI
    const methodAbi = contract.abi.find(method => 
        method.name === functionName && method.type === 'function'
    );
    
    const paramTypes = methodAbi.inputs.map(input => input.type);
    
    // Encode the parameters
    const encodedParams = tronWeb.eth.abi.encodeParameters(paramTypes, args);
    
    // Combine function selector with encoded parameters
    return functionSelector + encodedParams.slice(2); // Remove '0x' prefix from params
}

module.exports = async function (deployer, network, accounts) {
    console.log(`\n=== Deploying using account: ${accounts} ===`);
    console.log(`\n=== Starting Deployment to Network: ${network} ===`);

    if (!process.env.PRIVATE_KEY_NILE) {
        throw new Error("Missing PRIVATE_KEY_NILE in environment variables.");
    }

    const diamondOwner = accounts;
    const tronWeb = new TronWeb({
        fullHost: "http://127.0.0.1:9090", // Update for production
        privateKey: process.env.PRIVATE_KEY_NILE,
    });

    try {
        console.log("\n--- Deploying DiamondCutFacet ---");
        await deployer.deploy(DiamondCutFacet);
        const diamondCutFacet = await DiamondCutFacet.deployed();
        console.log("DiamondCutFacet Address:", diamondCutFacet.address);

        console.log("\n--- Deploying Diamond ---");
        await deployer.deploy(Diamond, diamondOwner, diamondCutFacet.address);
        const diamond = await Diamond.deployed();
        console.log("Diamond Address:", diamond.address);

        console.log("\n--- Deploying DiamondInit ---");
        await deployer.deploy(DiamondInit);
        const diamondInit = await DiamondInit.deployed();
        console.log("DiamondInit Address:", diamondInit.address);

        console.log("\n--- Deploying Facets ---");
        const cut = [];
        const facets = {};

        for (const FacetName of FacetNames) {
            const Facet = artifacts.require(FacetName);
            await deployer.deploy(Facet);
            const facet = await Facet.deployed();
            console.log(`${FacetName} Address:`, facet.address);

            facets[FacetName] = facet.address;
            const selectors = getSelectors(facet);
            console.log(`Selectors for ${FacetName}:`, selectors);

            cut.push({
                facetAddress: facet.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors,
            });
        }

        console.log("\n--- Encoding Initialization ---");
        const initData = encodeInitializerFunction(diamondInit, init);

        console.log('Encoded Init Data:', initData);

        const diamondCutData = cut.map(facetCut => ({
            facetAddress: TronWeb.address.fromHex(facetCut.facetAddress),
            action: facetCut.action,
            functionSelectors: facetCut.functionSelectors.map(selector => selector.startsWith("0x") ? selector : "0x" + selector),
        }));

        console.log('Diamond Cut Data:', JSON.stringify(diamondCutData, null, 2));

        // ABI encoding for txParams
        const abiEncodedTxParams = tronWeb.utils.abi.encodeParams(
            [
                {
                    type: 'tuple[]',
                    components: [
                        { name: 'facetAddress', type: 'address' },
                        { name: 'action', type: 'uint8' },
                        { name: 'functionSelectors', type: 'bytes4[]' },
                    ],
                },
                { type: 'address' },
                { type: 'bytes' },
            ],
            [diamondCutData, diamondInit.address, initData]
        );

        // Perform diamond cut using TronWeb
        console.log('Performing diamond cut...');
        const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
            diamond.address,
            'diamondCut(tuple(address,uint8,bytes4[])[],address,bytes)',
            {}, // Options
            abiEncodedTxParams, // ABI-encoded parameters
            diamondOwner // Owner address
        );

        // Sign and send the transaction
        const signedTx = await tronWeb.trx.sign(transaction);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);
        console.log('Diamond cut transaction sent, txid:', receipt.txid);

        // Wait for confirmation
        const txInfo = await tronWeb.trx.getTransactionInfo(receipt.txid);
        console.log('Diamond cut confirmed:', txInfo);

        return diamond.address;
    } catch (error) {
        console.error("\nDeployment Failed:", error);
        throw error;
    }
};