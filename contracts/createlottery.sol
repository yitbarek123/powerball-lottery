// contracts/GameItem.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./try.sol";

contract CreateLottery {
    address owner;
    address public nft_contract_address;
    
    event newadd(address newadd);
    constructor(address contract_address) public {
        owner=msg.sender;
        nft_contract_address=contract_address;
    }
    
    function createLottery(uint M, uint price) public returns(address tryAddress){
        address a=address(new Try(1,16, nft_contract_address,msg.sender));
        emit newadd(a);
        return a;
    }

}
