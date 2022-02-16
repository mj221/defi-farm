const TokenFarm = artifacts.require("TokenFarm");
const PoiToken = artifacts.require("PoiToken");
const DaiToken = artifacts.require("DaiToken");

require('chai').use(require('chai-as-promised')).should()

function tokens(n){
	return web3.utils.toWei(n, 'ether')
}

contract ('TokenFarm', ([owner, investor]) => {
	let daiToken, poiToken, tokenFarm

	before(async () => {
		daiToken = await DaiToken.new()
		poiToken = await PoiToken.new()
		tokenFarm = await TokenFarm.new(poiToken.address, daiToken.address)

		await poiToken.transfer(tokenFarm.address, tokens('1000000'))
		await daiToken.transfer(investor, tokens('100'), {from: owner})
	})
	describe('Mock Dai deployment', async() =>{
		it('has a name', async() => {
			let name = await daiToken.name()
			assert.equal(name, 'Mock DAI Token')
		})
	})
	describe('Poi Token deployment', async() =>{
		it('has a name', async() => {
			let name = await poiToken.name()
			assert.equal(name, 'Poi Token')
		})
	})
	describe('Token farm deployment', async() =>{
		it('has a name', async() => {
			let name = await tokenFarm.name()
			assert.equal(name, 'Token Farm')
		})
		it('Has tokens', async() => {
			let balance = await poiToken.balanceOf(tokenFarm.address)
			assert.equal(balance, tokens('1000000'))
		})
	})
	describe('Farming tokens', async() => {
		it('reward investors for staking mDai', async()=>{
			let result
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor Mock DAI balance correct before staking')

			await daiToken.approve(tokenFarm.address, tokens('100'), {from: investor})
			await tokenFarm.stakeTokens(tokens('100'), {from: investor})

			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('0'), 'investor mDai wallet balance = 0')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('100'), 'farm mDai wallet balance correct')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('100'), 'investor staking balance correct')

			result = await tokenFarm.isStaking(investor)
			assert.equal(result.toString(), 'true', 'investor staking status correct')

			await tokenFarm.issueTokens({from: owner})

			result = await poiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'Investor has received poi tokens correcly after issuance')

			await tokenFarm.issueTokens({from: investor}).should.be.rejected;

			await tokenFarm.unstakeTokens({from: investor})
			result = await daiToken.balanceOf(investor)
			assert.equal(result.toString(), tokens('100'), 'investor mDai wallet balance correct')

			result = await daiToken.balanceOf(tokenFarm.address)
			assert.equal(result.toString(), tokens('0'), 'token farm mDai wallet balance correct')

			result = await tokenFarm.stakingBalance(investor)
			assert.equal(result.toString(), tokens('0'), 'Investor staking balance correct')

		})
	})

})