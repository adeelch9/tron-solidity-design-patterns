const TronWeb = require('tronweb')

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 }

// Get function selectors from ABI
function getSelectors(contract) {
    // Extract function signatures from contract ABI
    const signatures = Object.keys(contract.abi.reduce((acc, val) => {
        if (val.type === 'function') {
            // Build function signature
            const inputs = val.inputs ? val.inputs.map(input => input.type).join(',') : ''
            const signature = `${val.name}(${inputs})`
            if (val.name !== 'init') {
                acc[signature] = true
            }
        }
        return acc
    }, {}))

    // Convert signatures to selectors
    const selectors = signatures.map(signature => 
        TronWeb.sha3(signature).slice(0, 10)
    )

    // Add helper methods
    selectors.contract = contract
    selectors.remove = remove
    selectors.get = get
    
    return selectors
}

// Get function selector from function signature
function getSelector(func) {
    // Remove 'function ' prefix if present
    const signature = func.replace('function ', '')
    return TronWeb.sha3(signature).slice(0, 10)
}

// Used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures
function remove(functionNames) {
    const selectors = this.filter((v) => {
        for (const functionName of functionNames) {
            // Find the function in the ABI
            const abiFunc = this.contract.abi.find(abi => {
                if (abi.type !== 'function') return false
                const inputs = abi.inputs ? abi.inputs.map(input => input.type).join(',') : ''
                const signature = `${abi.name}(${inputs})`
                return signature === functionName || abi.name === functionName.split('(')[0]
            })

            if (abiFunc) {
                const inputs = abiFunc.inputs ? abiFunc.inputs.map(input => input.type).join(',') : ''
                const signature = `${abiFunc.name}(${inputs})`
                if (v === TronWeb.sha3(signature).slice(0, 10)) {
                    return false
                }
            }
        }
        return true
    })

    selectors.contract = this.contract
    selectors.remove = this.remove
    selectors.get = this.get
    return selectors
}

// Used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(functionNames) {
    const selectors = this.filter((v) => {
        for (const functionName of functionNames) {
            // Find the function in the ABI
            const abiFunc = this.contract.abi.find(abi => {
                if (abi.type !== 'function') return false
                const inputs = abi.inputs ? abi.inputs.map(input => input.type).join(',') : ''
                const signature = `${abi.name}(${inputs})`
                return signature === functionName || abi.name === functionName.split('(')[0]
            })

            if (abiFunc) {
                const inputs = abiFunc.inputs ? abiFunc.inputs.map(input => input.type).join(',') : ''
                const signature = `${abiFunc.name}(${inputs})`
                if (v === TronWeb.sha3(signature).slice(0, 10)) {
                    return true
                }
            }
        }
        return false
    })

    selectors.contract = this.contract
    selectors.remove = this.remove
    selectors.get = this.get
    return selectors
}

// Remove selectors using an array of signatures
function removeSelectors(selectors, signatures) {
    const removeSelectors = signatures.map(v => TronWeb.sha3(v).slice(0, 10))
    selectors = selectors.filter(v => !removeSelectors.includes(v))
    return selectors
}

// Find a particular address position in the return value of diamondLoupeFacet.facets()
function findAddressPositionInFacets(facetAddress, facets) {
    for (let i = 0; i < facets.length; i++) {
        if (facets[i].facetAddress === facetAddress) {
            return i
        }
    }
}

// Helper function to format function selectors for TRON
function formatSelector(selector) {
    return selector.startsWith('0x') ? selector : '0x' + selector
}

// Helper function to verify selectors
async function validateSelectors(contract, selectors) {
    try {
        const facetAddresses = []
        for (const selector of selectors) {
            const facetAddress = await contract.facetAddress(formatSelector(selector))
            facetAddresses.push(facetAddress)
        }
        return facetAddresses
    } catch (error) {
        console.error('Error validating selectors:', error)
        throw error
    }
}

module.exports = {
    FacetCutAction,
    getSelectors,
    getSelector,
    remove,
    removeSelectors,
    findAddressPositionInFacets,
    validateSelectors,
    formatSelector
}