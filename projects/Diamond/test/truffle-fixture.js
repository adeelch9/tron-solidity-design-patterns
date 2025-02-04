/* eslint-disable prefer-const */
/* global artifacts */
const Diamond = artifacts.require('Diamond')
const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const Test1Facet = artifacts.require('Test1Facet')
const Test2Facet = artifacts.require('Test2Facet')

const FacetCutAction = {
  Add: 0,
  Replace: 1,
  Remove: 2
}

function getSelectors (contract) {
  const selectors = contract.abi.reduce((acc, val) => {
    if (val.type === 'function') {
      acc.push(val.signature)
      return acc
    } else {
      return acc
    }
  }, [])
  return selectors
}

// https://hardhat.org/guides/truffle-migration.html#migrations-and-hardhat-truffle-fixtures
module.exports = async () => {
  // eslint-disable-next-line no-undef
  const accounts = await ethers.getSigners()
  const admin = accounts[0]

  const cutFacet = await DiamondCutFacet.new()
  const loupeFacet = await DiamondLoupeFacet.new()

  const diamondCut = [
    [cutFacet.address, FacetCutAction.Add, getSelectors(DiamondCutFacet)],
    [loupeFacet.address, FacetCutAction.Add, getSelectors(DiamondLoupeFacet)],
    [OwnershipFacet.address, FacetCutAction.Add, getSelectors(OwnershipFacet)]
  ]

  await Diamond.new(diamondCut, admin)
  await Test1Facet.new()
  await Test2Facet.new()
}
