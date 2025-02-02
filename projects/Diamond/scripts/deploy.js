const { FacetCutAction } = require('./libraries/diamond.js')

/**
 * Deploys the diamond.
 * @param  {Web3} web3 instance
 * @param  {Object} deployer Truffle deployer instance
 * @param  {string} network  Network name
 * @param  {Array} accounts Array of Tron account addresses
 * @return {Promise}
 */
async function deployDiamond(deployer, network, accounts) {
    try {
        console.log(`Deploying to network (deployDiamond): ${network}`)
        console.log('Using account (deployDiamond):', accounts)

        const tronWeb = deployer.tronWeb
        const contractOwner = accounts

        // Deploy DiamondCutFacet
        const DiamondCutFacet = artifacts.require("DiamondCutFacet")
        await deployer.deploy(DiamondCutFacet)
        const diamondCutFacet = await DiamondCutFacet.deployed()
        console.log('DiamondCutFacet deployed:', diamondCutFacet.address)

        // Deploy Diamond
        const Diamond = artifacts.require("Diamond")
        await deployer.deploy(Diamond, contractOwner, diamondCutFacet.address)
        const diamond = await Diamond.deployed()
        console.log('Diamond deployed:', diamond.address)

        // Deploy DiamondInit
        const DiamondInit = artifacts.require("DiamondInit")
        await deployer.deploy(DiamondInit)
        const diamondInit = await DiamondInit.deployed()
        console.log('DiamondInit deployed:', diamondInit.address)

        // Deploy facets
        console.log('\nDeploying facets')
        const FacetNames = [
            'DiamondLoupeFacet',
            'OwnershipFacet'
        ]
        const cut = []
        
        for (const FacetName of FacetNames) {
            const Facet = artifacts.require(FacetName)
            await deployer.deploy(Facet)
            const facet = await Facet.deployed()
            console.log(`${FacetName} deployed: ${facet.address}`)
            
            const selectors = getSelectors(facet)
            cut.push({
                facetAddress: facet.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            })
        }

        // Upgrade diamond with facets
        console.log('\nDiamond Cut:', JSON.stringify(cut, null, 2))
        
        // Get DiamondCutFacet contract instance at Diamond address
        const diamondCut = await DiamondCutFacet.at(diamond.address)
        
        // Encode initialization function call
        const functionCall = tronWeb.sha3('init()').slice(0, 10)  // Get function selector for 'init()'
        
        // Perform diamond cut
        let tx = await diamondCut.diamondCut(
            cut,
            diamondInit.address,
            functionCall,
            {
                feeLimit: 100000000,
                callValue: 0,
            }
        )
        
        console.log('Diamond cut tx: ', tx.txid)
        
        // Wait for transaction confirmation
        let receipt = await tronWeb.trx.getTransaction(tx.txid)
        while (!receipt || !receipt.ret) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            receipt = await tronWeb.trx.getTransaction(tx.txid)
        }
        
        if (!receipt.ret[0].contractRet || receipt.ret[0].contractRet !== 'SUCCESS') {
            throw Error(`Diamond upgrade failed: ${tx.txid}`)
        }
        
        console.log('Completed diamond cut')
        
        // Return deployed addresses
        return {
            diamond: diamond.address,
            diamondCut: diamondCutFacet.address,
            diamondInit: diamondInit.address,
            facets: cut.map(f => ({ name: f.facetName, address: f.facetAddress }))
        }
        
    } catch (error) {
        console.error('Error in deployDiamond:', error)
        throw error
    }
}

module.exports = async function(deployer, network, accounts) {
    if (network === 'development' || network === 'shasta' || network === 'mainnet' || network === 'nile') {
        await deployDiamond(deployer, network, accounts)
    } else {
        console.log(`Deployment to ${network} network not supported`)
    }
}