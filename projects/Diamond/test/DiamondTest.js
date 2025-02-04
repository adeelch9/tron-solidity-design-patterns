/* eslint-disable prefer-const */
/* global contract artifacts tronWeb before it assert */

const Diamond = artifacts.require('Diamond')
const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const Test1Facet = artifacts.require('Test1Facet')
const Test2Facet = artifacts.require('Test2Facet')
import { TronWeb } from "tronweb"

const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2
}

function getSelectors(contract) {
  const selectors = contract.abi.reduce((acc, val) => {
    if (val.type === 'function') {
      const funcHash = TronWeb.sha3(val.name + '(' + val.inputs.map(input => input.type).join(',') + ')')
      acc.push(funcHash.slice(0, 10))
      return acc
    } else {
      return acc
    }
  }, [])
  return selectors
}

function removeItem(array, item) {
  array.splice(array.indexOf(item), 1)
  return array
}

function findPositionInFacets(facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i
    }
  }
}

contract('DiamondTest', async (accounts) => {
  let diamondCutFacet
  let diamondLoupeFacet
  let ownershipFacet
  let diamond
  let test1Facet
  let test2Facet
  let result
  let addresses = []

  const zeroAddress = '410000000000000000000000000000000000000000'

  before(async () => {
    test1Facet = await Test1Facet.deployed()
    test2Facet = await Test2Facet.deployed()
    diamond = await Diamond.deployed()
    
    diamondCutFacet = await tronWeb.contract(DiamondCutFacet.abi, diamond.address)
    diamondLoupeFacet = await tronWeb.contract(DiamondLoupeFacet.abi, diamond.address)
    ownershipFacet = await tronWeb.contract(OwnershipFacet.abi, diamond.address)
    
    tronWeb.setAddress(accounts[0])
  })

  it('should have three facets -- call to facetAddresses function', async () => {
    for (const address of await diamondLoupeFacet.facetAddresses().call()) {
      addresses.push(address)
    }
    assert.equal(addresses.length, 3)
  })

  it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
    let selectors = getSelectors(DiamondCutFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0]).call()
    assert.sameMembers(result, selectors)
    
    selectors = getSelectors(DiamondLoupeFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1]).call()
    assert.sameMembers(result, selectors)
    
    selectors = getSelectors(OwnershipFacet)
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2]).call()
    assert.sameMembers(result, selectors)
  })

  it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
    assert.equal(
      addresses[0],
      await diamondLoupeFacet.facetAddress('0x1f931c1c').call()
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0xcdffacc6').call()
    )
    assert.equal(
      addresses[1],
      await diamondLoupeFacet.facetAddress('0x01ffc9a7').call()
    )
    assert.equal(
      addresses[2],
      await diamondLoupeFacet.facetAddress('0xf2fde38b').call()
    )
  })

  it('should get all the facets and function selectors of the diamond -- call to facets function', async () => {
    result = await diamondLoupeFacet.facets().call()
    assert.equal(result[0].facetAddress, addresses[0])
    let selectors = getSelectors(DiamondCutFacet)
    assert.sameMembers(result[0].functionSelectors, selectors)
    assert.equal(result[1].facetAddress, addresses[1])
    selectors = getSelectors(DiamondLoupeFacet)
    assert.sameMembers(result[1].functionSelectors, selectors)
    assert.equal(result[2].facetAddress, addresses[2])
    selectors = getSelectors(OwnershipFacet)
    assert.sameMembers(result[2].functionSelectors, selectors)
    assert.equal(result.length, 3)
  })

  it('should add test1 functions', async () => {
    let selectors = getSelectors(test1Facet).slice(0, -1)
    addresses.push(test1Facet.address)
    await diamondCutFacet.diamondCut(
      [[test1Facet.address, FacetCutAction.Add, selectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 1000000000
    })
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]).call()
    assert.sameMembers(result, selectors)
  })

  it('should test function call', async () => {
    const test1FacetDiamond = await tronWeb.contract(Test1Facet.abi, diamond.address)
    await test1FacetDiamond.test1Func10().send({
      feeLimit: 1000000000
    })
  })

  it('should replace test1 function', async () => {
    let selectors = getSelectors(test1Facet).slice(-1)
    await diamondCutFacet.diamondCut(
      [[test1Facet.address, FacetCutAction.Replace, selectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 1000000000
    })
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]).call()
    assert.sameMembers(result, getSelectors(test1Facet))
  })

  it('should add test2 functions', async () => {
    const selectors = getSelectors(test2Facet)
    addresses.push(test2Facet.address)
    await diamondCutFacet.diamondCut(
      [[test2Facet.address, FacetCutAction.Add, selectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 1000000000
    })
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[4]).call()
    assert.sameMembers(result, selectors)
  })

  it('should remove some test2 functions', async () => {
    let selectors = getSelectors(test2Facet)
    let removeSelectors = [].concat(
      selectors.slice(0, 1),
      selectors.slice(4, 6),
      selectors.slice(-2)
    )
    await diamondCutFacet.diamondCut(
      [[zeroAddress, FacetCutAction.Remove, removeSelectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 1000000000
    })
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[4]).call()
    selectors = [].concat(
      selectors.slice(-5, -4),
      selectors.slice(1, 4),
      selectors.slice(-4, -2),
      selectors.slice(6, -5)
    )
    assert.sameMembers(result, selectors)
  })

  it('should remove some test1 functions', async () => {
    let selectors = getSelectors(test1Facet)
    let removeSelectors = [].concat(
      selectors.slice(1, 2),
      selectors.slice(8, 10)
    )
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]).call()
    await diamondCutFacet.diamondCut(
      [[zeroAddress, FacetCutAction.Remove, removeSelectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 6000000000
    })
    result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3]).call()
    selectors = [].concat(
      selectors.slice(0, 1),
      selectors.slice(2, 8),
      selectors.slice(10)
    )
    assert.sameMembers(result, selectors)
  })

  it('remove all functions and facets accept diamondCut and facets', async () => {
    let removeSelectors = []
    let facets = await diamondLoupeFacet.facets().call()
    for (let i = 1; i < facets.length; i++) {
      removeSelectors.push(...facets[i].functionSelectors)
    }
    removeItem(removeSelectors, '0x7a0ed627')

    await diamondCutFacet.diamondCut(
      [[zeroAddress, FacetCutAction.Remove, removeSelectors]], 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 6000000000
    })
    facets = await diamondLoupeFacet.facets().call()
    assert.equal(facets.length, 2)
    assert.equal(facets[0][0], addresses[0])
    assert.sameMembers(facets[0][1], ['0x1f931c1c'])
    assert.equal(facets[1][0], addresses[1])
    assert.sameMembers(facets[1][1], ['0x7a0ed627'])
  })

  it('add most functions and facets', async () => {
    const diamondCut = []
    const selectors = getSelectors(DiamondLoupeFacet)
    removeItem(selectors, '0x7a0ed627')
    selectors.pop()
    
    diamondCut.push([addresses[1], FacetCutAction.Add, selectors])
    diamondCut.push([addresses[2], FacetCutAction.Add, getSelectors(OwnershipFacet)])
    diamondCut.push([addresses[3], FacetCutAction.Add, getSelectors(test1Facet)])
    diamondCut.push([addresses[4], FacetCutAction.Add, getSelectors(test2Facet)])
    
    await diamondCutFacet.diamondCut(
      diamondCut, 
      zeroAddress, 
      '0x'
    ).send({
      feeLimit: 6000000000
    })
    
    const facets = await diamondLoupeFacet.facets().call()
    const facetAddresses = await diamondLoupeFacet.facetAddresses().call()
    
    assert.equal(facetAddresses.length, 5)
    assert.equal(facets.length, 5)
    assert.sameMembers(facetAddresses, addresses)
    assert.equal(facets[0][0], facetAddresses[0], 'first facet')
    assert.equal(facets[1][0], facetAddresses[1], 'second facet')
    assert.equal(facets[2][0], facetAddresses[2], 'third facet')
    assert.equal(facets[3][0], facetAddresses[3], 'fourth facet')
    assert.equal(facets[4][0], facetAddresses[4], 'fifth facet')
    
    assert.sameMembers(
      facets[findPositionInFacets(addresses[0], facets)][1],
      getSelectors(DiamondCutFacet)
    )
    assert.sameMembers(
      facets[findPositionInFacets(addresses[1], facets)][1],
      removeItem(getSelectors(DiamondLoupeFacet), '0x01ffc9a7')
    )
    assert.sameMembers(
      facets[findPositionInFacets(addresses[2], facets)][1],
      getSelectors(OwnershipFacet)
    )
    assert.sameMembers(
      facets[findPositionInFacets(addresses[3], facets)][1],
      getSelectors(test1Facet)
    )
    assert.sameMembers(
      facets[findPositionInFacets(addresses[4], facets)][1],
      getSelectors(test2Facet)
    )
  })
})