// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract faucetv1 {
    event donationhappened(address indexed donator, uint indexed amountDonated);
    receive() external payable {
        emit donationhappened(msg.sender, msg.value);
    }


    function withdraw(uint amount) external payable{
        require (amount <= .1 ether);
        (bool wsuccess, ) = payable(msg.sender).call{value: amount}("");
        require(wsuccess, "withdraw failed");

    } 
}