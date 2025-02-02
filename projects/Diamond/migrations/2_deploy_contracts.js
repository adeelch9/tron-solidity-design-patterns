const deployDiamond = require('../scripts/deploy.js')

module.exports = async function(deployer, network, accounts) {
    console.log(`Deploying to network: ${network}`)
    console.log('Using account:', accounts)
    
    try {
        const result = await deployDiamond(deployer, network, accounts)
        
        // Save deployment addresses to a file
        const fs = require('fs')
        const deploymentPath = `./deployments/${network}.json`
        
        // Ensure deployments directory exists
        if (!fs.existsSync('./deployments')) {
            fs.mkdirSync('./deployments')
        }
        
        // Save deployment information
        fs.writeFileSync(
            deploymentPath,
            JSON.stringify(result, null, 2)
        )
        
        console.log(`Deployment addresses saved to ${deploymentPath}`)
        
    } catch (error) {
        console.error('Deployment failed:', error)
        throw error
    }
}