const TokenFarm = artifacts.require("TokenFarm");
const PoiToken = artifacts.require("PoiToken");
const DaiToken = artifacts.require("DaiToken");

module.exports = async function(deployer, network, accounts) {

  await deployer.deploy(PoiToken);
  const poitoken = await PoiToken.deployed();

  await deployer.deploy(DaiToken);
  const daitoken = await DaiToken.deployed();

  await deployer.deploy(TokenFarm, poitoken.address, daitoken.address);
  const tokenfarm = await TokenFarm.deployed()

  var totalSupply = '1000000000000000000000000';
  await poitoken.transfer(tokenfarm.address, totalSupply)
  await daitoken.transfer(accounts[1], totalSupply)

};
