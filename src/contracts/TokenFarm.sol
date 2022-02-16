pragma solidity ^0.8.4;

import "./PoiToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
	string public name = "Token Farm";
	address public owner;

	PoiToken public poiToken;
	DaiToken public daiToken;

	address[] public stakers;
	mapping(address => uint) public stakingBalance;
	mapping(address => bool) public hasStaked;
	mapping(address => bool) public isStaking;
 
	constructor(PoiToken _poiToken, DaiToken _daiToken){
		poiToken = _poiToken;
		daiToken = _daiToken;
		owner = msg.sender;
	}

	function stakeTokens(uint _amount) public{
		require(_amount > 0);
		daiToken.transferFrom(msg.sender, address(this), _amount);

		stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

		if(!hasStaked[msg.sender]){
			stakers.push(msg.sender);
		}
		hasStaked[msg.sender] = true;
		isStaking[msg.sender] = true;
	}
	function unstakeTokens() public {
		uint balance = stakingBalance[msg.sender];
		require(balance > 0);
		daiToken.transfer(msg.sender, balance);
		stakingBalance[msg.sender] = 0;
		isStaking[msg.sender] = false;
	}
	function issueTokens() public{
		require(msg.sender == owner);
		for (uint i = 0; i < stakers.length; i++){
			address recipient = stakers[i];
			uint balance = stakingBalance[recipient];
			if(balance > 0){
				poiToken.transfer(recipient, balance);
			}
		}
	}
}
