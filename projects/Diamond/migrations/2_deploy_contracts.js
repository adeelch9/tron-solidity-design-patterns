// Import necessary libraries
const Diamond = artifacts.require('Diamond');
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet');
const OwnershipFacet = artifacts.require('OwnershipFacet');
const DiamondCutFacet = artifacts.require('DiamondCutFacet');
const DiamondInit = artifacts.require('DiamondInit');
const Test1Facet = artifacts.require('Test1Facet');
const Test2Facet = artifacts.require('Test2Facet');

const FacetNames = [
    'DiamondLoupeFacet',
    'OwnershipFacet',
    'Test1Facet',
    'Test2Facet'
];

const FacetCutAction = {
    Add: 0,
    Replace: 1,
    Remove: 2
};

function getSelectors(contract) {
    const signatures = Object.keys(contract.abi.filter(a => a.type === 'function'));
    const selectors = signatures.reduce((acc, val) => {
        if (val !== 'init(bytes)') {
            acc.push(contract.web3.eth.abi.encodeFunctionSignature(val));
        }
        return acc;
    }, []);
    selectors.contract = contract;
    return selectors;
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

            // Add facet to cut array
            cut.push({
                facetAddress: facet.address,
                action: FacetCutAction.Add,
                functionSelectors: getSelectors(facet)
            });
        }

        console.log('Diamond Cut:', cut);

        // Get DiamondCut interface
        const diamondCutContract = await DiamondCutFacet.at(diamond.address);

        // Encode init function call
        const functionCall = diamondInit.contract.methods.init().encodeABI();

        // Perform diamond cut
        console.log('Performing diamond cut...');
        const tx = await diamondCutContract.diamondCut(
            cut,
            diamondInit.address,
            functionCall,
            { from: diamondOwner }
        );

        console.log('Diamond cut tx:', tx.tx);
        if (!tx.receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.tx}`);
        }

        console.log('Completed diamond cut');
        
        // Optional: Save deployment addresses
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