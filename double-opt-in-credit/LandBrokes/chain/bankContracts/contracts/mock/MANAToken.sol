pragma solidity 0.5.7;

import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Pausable.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20Burnable.sol";

contract MANAToken is ERC20Burnable, ERC20Pausable, ERC20Mintable {

  string public constant symbol = "MANA";

  string public constant name = "Decentraland MANA";

  uint8 public constant decimals = 18;

  function burn(uint256 _value) whenNotPaused public {
    super.burn(_value);
  }
}
