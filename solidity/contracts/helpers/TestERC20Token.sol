pragma solidity ^0.4.11;
import '../ERC20Token.sol';

/*
    Test token with predefined supply
*/
contract TestERC20Token is ERC20Token {
    function TestERC20Token(string _name, string _symbol, uint256 _supply, uint8 _decimals)
        ERC20Token(_name, _symbol, _decimals)
    {
        totalSupply = _supply;
        balanceOf[msg.sender] = _supply;
    }
}
