const Diamond = artifacts.require('Diamond');
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet');
const OwnershipFacet = artifacts.require('OwnershipFacet');
const DiamondCutFacet = artifacts.require('DiamondCutFacet');
const DiamondInit = artifacts.require('DiamondInit');
const Test1Facet = artifacts.require('Test1Facet');
const Test2Facet = artifacts.require('Test2Facet');
const tronWeb = require('tronweb');
const crypto = require('crypto');

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

function getSelectors(contract) {
    const signatures = contract.abi
        .filter(a => a.type === 'function')
        .map(f => {
            if (f.name !== 'init(bytes)') {
                const functionSignature = f.name + '(' + f.inputs.map(input => input.type).join(',') + ')';
                const selector = tronWeb.utils.crypto.sha3(functionSignature).substring(2, 10);
                return '0x' + selector;
            }
            return null;
        })
        .filter(selector => selector !== null);
    return signatures;
}

function generateSelector(functionSignature) {
    return '0x' + crypto.createHash('sha256')
        .update(functionSignature)
        .digest('hex')
        .slice(0, 8);
}

module.exports = async function(deployer, network, accounts) {
    console.log(`Deploying to network: ${network}`);
    console.log('Using account:', accounts);
    const diamondOwner = accounts;
    
    try {
        // Deploy facets
        await deployer.deploy(DiamondCutFacet);
        const diamondCutFacet = await DiamondCutFacet.deployed();
        console.log('DiamondCutFacet deployed:', diamondCutFacet.address);

        // Deploy Diamond with diamondCut
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
            console.log('Selectors for', FacetName, ':', selectors); // Debug log

            cut.push({
                facetAddress: facet.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            });
        }

        console.log('Diamond Cut:', cut);

        // Create contract instance using TronBox artifacts
        const diamondCutContract = await DiamondCutFacet.at(diamond.address);

        // Encode init function call
        const initFunctionSignature = 'init';
        const functionCall = generateSelector(initFunctionSignature);

        // Perform diamond cut using TronBox contract instance
        console.log('Performing diamond cut...');
        const tx = await diamondCutContract.diamondCut(
            cut,
            diamondInit.address,
            functionCall,
            { from: diamondOwner }
        );

        console.log('Diamond cut tx:', tx.txID); // Note: txID instead of txid

        // Wait for transaction confirmation using TronWeb
        await tronWeb.Trx.getTransaction(tx.txID); // Wait for transaction to be confirmed
        console.log('Transaction confirmed');

        console.log('Completed diamond cut');

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