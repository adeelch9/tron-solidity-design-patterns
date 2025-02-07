/* eslint-disable prefer-const */
/* global contract artifacts tronWeb before it assert */

const Diamond = artifacts.require('Diamond')
const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const Test1Facet = artifacts.require('Test1Facet')
const Test2Facet = artifacts.require('Test2Facet')
import { TronWeb } from "tronweb"

var diamondContract;
var test1Facet;
var test2Facet;
var diamondCutFacet;
var diamondLoupeFacet;
var ownershipFacet;

let addresses = []

const tronWeb = new TronWeb({
  fullHost: process.env.FULL_HOST, // Update for production
  privateKey: process.env.PRIVATE_KEY,
});

contract('Diamond', (accounts) => {
  before(async function () {
    diamondCutFacet = await DiamondCutFacet.deployed()
    diamondContract = await Diamond.deployed()
    diamondLoupeFacet = await DiamondLoupeFacet.deployed()
    ownershipFacet = await OwnershipFacet.deployed()
    test1Facet = await Test1Facet.deployed()
    test2Facet = await Test2Facet.deployed()

    tronWeb.setAddress(accounts[0])
  })
})