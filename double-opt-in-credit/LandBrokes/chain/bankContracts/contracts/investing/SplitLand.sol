pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../interfaces/ISplitLand.sol";

contract SplitLand is ISplitLand {

  using SafeMath for uint256;
  using SafeMath for uint;

  constructor(
    address[] memory investors,
    uint256[] memory money,
    uint256 totalLandSlices,
    uint256 landId
  ) public {

    require(investors.length == money.length, "The two arrays do not have the same lengths");

    uint i = 0;
    uint256 totalMoney = 0;

    for (i = 0; i < money.length; i++) {

      totalMoney = totalMoney.add(money[i]);

    }

    uint256 countingSlices = 0;

    uint256 currentSlices = 0;

    for (i = 0; i < investors.length; i++) {

      currentSlices = money[i] * 100 / totalMoney;

      if (i == investors.length - 1) {

        super.mint(investors[i], totalLandSlices - countingSlices);

        countingSlices = totalLandSlices;

      } else {

        super.mint(investors[i], currentSlices * totalLandSlices / 100);

        countingSlices = countingSlices.add(currentSlices * totalLandSlices / 100);

      }

      decentralandLandId = landId;

    }

  }

}
