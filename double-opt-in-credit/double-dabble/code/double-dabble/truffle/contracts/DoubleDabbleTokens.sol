pragma solidity ^0.5;
/*
    Credit score token
    Anyone can have a supply
*/

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract DoubleDabbleToken is Ownable {

    using SafeMath for uint256;

    mapping (address => uint256) private _credit;
    mapping (address => uint256) private _stakedTotal;
    mapping (address => mapping (address => uint256)) private _approvalBalance;
    mapping (address => mapping (address => uint256)) private _stakedBalance;

    event CreditGranted(address subject, address grantor, uint amount);
    event CreditStaked(address subject, address recipient, uint amount);
    event CreditStakeApproved(address subject, address recipient, uint amount);
    event CreditStakeAccepted(address subject, address recipient, uint amount);
    event CreditStakeRejected(address subject, address recipient, uint amount);
    event CreditSlashed(address subject, address recipient, uint amount);
    event CreditReturned(address subject, address recipient, uint amount);

    // @dev Demo puropses: Owner can arbitrarily grant credit
    function grantCredit(address subject, uint amount) public onlyOwner() {
        _credit[subject] = _credit[subject].add(amount);
        emit CreditGranted(subject, msg.sender, amount);
    }

    // @dev Pull model - approve another address claim credit as stake
    function approveStake(address recipient, uint amount) public {
        require(_isApprovalAvailable(msg.sender, recipient, amount));

        _approveStake(msg.sender, recipient, amount);
        emit CreditStakeApproved(msg.sender, recipient, amount);
    }

    // @dev Pull model - accept an approved stake
    function acceptStake(address subject, uint amount) public {
        require(_isApprovalAvailable(subject, msg.sender, amount));
        _transferStake(subject, msg.sender, amount);
        emit CreditStakeAccepted(subject, msg.sender, amount);
    }

    // @dev Pull model - reject stake send by another address
    function rejectStake(address subject, uint amount) public {
        require(_isApprovalAvailable(subject, msg.sender, amount), "Insufficent approved credit stake");
    }

    function returnStake(address subject, uint amount) public {
    }

    // @dev Slash a users' stake who previously staked credit with sender. Justification and trust are between the parties involved.
    function slashCredit(address subject, uint amount) public {
        require(_stakedBalance[subject][msg.sender] >= amount);

        _credit[subject] = _credit[subject].sub(amount);
        _stakedTotal[subject] = _stakedTotal[subject].sub(amount);

        // _stakedBalance[subject][msg.sender] = _stakedBalance[subject][msng.sender];
    }

    function _isCreditAvailable(address subject, uint amount) internal view returns (bool) {
        if (_credit[subject] >= amount && _stakedTotal[subject] + amount <= _credit[subject]) {
            return true;
        } else {
            return false;
        }
    }

    function _isApprovalAvailable(address subject, address recipient, uint amount) internal view returns (bool) {
        if (_approvalBalance[subject][recipient] >= amount) {
            return true;
        } else {
            return false;
        }
    }

    function _isStakeAvailable(address subject, address recipient, uint amount) internal view returns (bool) {
        if (_stakedBalance[subject][recipient] >= amount) {
            return true;
        } else {
            return false;
        }
    }
    
    function _transferStake(address subject, address recipient, uint amount) internal {
        _stakedTotal[subject] = _stakedTotal[subject].add(amount);
        _stakedBalance[subject][recipient] = _stakedBalance[subject][recipient].add(amount);
    }

    function _approveStake(address subject, address recipient, uint amount) internal {
        // Add amount to subject's total stake
        _stakedTotal[subject] = _stakedTotal[subject].add(amount);

        // Reduce approval balance for recipient from subject by amount
        _approvalBalance[subject][recipient] = _approvalBalance[subject][recipient].sub(amount);

        // Increase staked balance for recipient from subject by amount
        _stakedBalance[subject][recipient] = _stakedBalance[subject][recipient].add(amount);
    }
}