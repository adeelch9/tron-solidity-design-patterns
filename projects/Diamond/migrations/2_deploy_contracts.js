const Diamond = artifacts.require('Diamond');
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet');
const OwnershipFacet = artifacts.require('OwnershipFacet');
const DiamondCutFacet = artifacts.require('DiamondCutFacet');
const DiamondInit = artifacts.require('DiamondInit');
const Test1Facet = artifacts.require('Test1Facet');
const Test2Facet = artifacts.require('Test2Facet');
const { TronWeb } = require('tronweb');
const { ethers } = require('ethers');

const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    /*
    add other facet names here
    e.g.
    'Test1Facet'
    'Test2Facet'
    */
];

const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2
};

// Helper function to get function selectors using ethers
function getSelectors(contract) {
    const selectors = contract.abi
        .filter(item => item.type === 'function')
        .map(f => {
            if (f.name !== 'init(bytes)') {
                const functionSignature = ethers.utils.Fragment.from(f).format();
                return ethers.utils.id(functionSignature).slice(0, 10);
            }
            return null;
        })
        .filter(selector => selector !== null);
    return selectors;
}

// Helper function to encode initialization call data using ethers
function encodeInitializerFunction(diamondInit, functionName, args = []) {
    const iface = new ethers.utils.Interface(diamondInit.abi);
    return iface.encodeFunctionData(functionName, args);
}

module.exports = async function (deployer, network, accounts) {
    console.log(`Deploying to network: ${network}`);
    console.log('Using account:', accounts);
    const diamondOwner = accounts;

    // Initialize TronWeb (you'll need to add your own configuration)
    const tronWeb = new TronWeb({
        fullHost: 'https://nile.trongrid.io/', // Replace with your network
        privateKey: process.env.PRIVATE_KEY_NILE // Make sure to set this in your environment
    });

    try {
        // Deploy DiamondCutFacet
        await deployer.deploy(DiamondCutFacet);
        const diamondCutFacet = await DiamondCutFacet.deployed();
        console.log('DiamondCutFacet deployed:', diamondCutFacet.address);

        // Deploy Diamond
        await deployer.deploy(Diamond, diamondOwner, diamondCutFacet.address);
        const diamond = await Diamond.deployed();
        console.log('Diamond deployed:', diamond.address);

        // Deploy DiamondInit
        await deployer.deploy(DiamondInit);
        const diamondInit = await DiamondInit.deployed();
        console.log('DiamondInit deployed:', diamondInit.address);

        // Deploy remaining facets
        console.log('Deploying facets');
        const cut = [];
        const facets = {};

        for (const FacetName of FacetNames) {
            const Facet = artifacts.require(FacetName);
            await deployer.deploy(Facet);
            const facet = await Facet.deployed();
            console.log(`${FacetName} deployed:`, facet.address);
            facets[FacetName] = facet.address;

            const selectors = getSelectors(facet);
            console.log('Selectors for', FacetName, ':', selectors);

            cut.push({
                facetAddress: facet.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            });
        }
        // Encode initialization call
        const initData = encodeInitializerFunction(diamondInit, 'init');

        // Convert the diamond cut data for TronWeb
        const diamondCutData = cut.map(facetCut => ({
            facetAddress: TronWeb.address.toHex(facetCut.facetAddress),
            action: facetCut.action,
            functionSelectors: facetCut.functionSelectors.map(selector =>
                selector.startsWith('0x') ? selector : '0x' + selector
            )
        }));

        // Perform diamond cut using TronWeb
        console.log('Performing diamond cut...');
        const txParams = {
            facetCuts: diamondCutData,
            init: diamondInit.address,
            _calldata: initData
        };

        const transaction = await tronWeb.transactionBuilder.triggerSmartContract(
            diamond.address,
            'diamondCut(tuple(address,uint8,bytes4[])[],address,bytes)',
            {},
            txParams,
            diamondOwner
        );

        const signedTx = await tronWeb.trx.sign(transaction);
        const receipt = await tronWeb.trx.sendRawTransaction(signedTx);

        console.log('Diamond cut transaction:', receipt.txid);

        // Wait for transaction confirmation
        await tronWeb.trx.getTransactionInfo(receipt.txid);
        console.log('Diamond cut confirmed');

        const deploymentInfo = {
            diamond: diamond.address,
            diamondInit: diamondInit.address,
            diamondCut: diamondCutFacet.address,
            facets: facets
        };

        console.log('Deployment Info:', deploymentInfo);
        return diamond.address;

    } catch (error) {
        console.error('Deployment failed:', error);
        throw error;
    }
};