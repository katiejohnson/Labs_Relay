pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";
import "openzeppelin-solidity/contracts/utils/Address.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

//import "../interfaces/IBid.sol";
import "../investing/SplitLand.sol";
import "../interfaces/IBank.sol";
import "../interfaces/decentraland/IMarketplace.sol";

contract Bank is IBank, Ownable {

  using SafeMath for uint256;
  using SafeMath for int256;
  using Address for address;

  //IBid decentralandBid;

  address decentralandBid;

  bytes nullBytes = bytes("0");
  /**
   * @dev Magic value to be returned upon successful reception of an NFT
   *  Equals to `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`
   */
  bytes4 constant ERC721_RECEIVED = 0xf0b9e5ba;

  modifier checkBeforeBuying(uint8 investmentType,
    uint256 investorsLength,
    uint256 amountsInvestedLength,
    uint256 landId) {

    require(investmentType == 0 || investmentType == 1, "The investment type needs to be between bounds");
    require(investorsLength == amountsInvestedLength,
      "The investors and _amountsInvested arrays do not have the same length");
    require(landIsInBank[landId] == false, "The land specified is already owned by the bank");

    if (investmentType == 0) {

      require(investorsLength == 1,
        "With a whole investment there needs to be only 1 investor");

    } else if (investmentType == 1) {

      require(investorsLength > 1,
        "With a split investment there needs to be more than one investor");

    }

    _;

  }

  modifier onlyOngoingBid(uint256 bidPosition) {

    require(bidPosition < bids.length,
      "The bid position is not within bounds");

    require(bids[bidPosition].bidStatus == uint8(BID_RESULT.ONGOING),
      "The bid is not ongoing");

    _;

  }

  constructor(
    string memory _manaTicker,
    uint8 _maxLandOwners,
    uint16 _max_land_splits,
    uint256 _maxBidDuration,
    uint256 _noActionCancelAfter,
    address _addressManaToken,
    address _addressMarketplace,
    address _addressLandToken,
    address _addressDecentralandBid,
    address _addressLandRegistry
  ) public {

    require(_maxLandOwners > 0, "You need a positive number of land owners");
    require(_max_land_splits > 0, "You need a positive number of land splits");
    require(_maxBidDuration > 0, "The bid duration needs to be positive");
    require(_noActionCancelAfter > 0, "_noActionCancelAfter has to be positive");

    MANA = keccak256(abi.encode(_manaTicker) );
    MAX_LAND_OWNERS = _maxLandOwners;
    MAX_LAND_SPLITS = _max_land_splits;
    BID_DURATION = _maxBidDuration;
    NO_ACTION_CANCEL_BID_AFTER = _noActionCancelAfter;
    manaToken = IERC20(_addressManaToken);
    marketplace = Marketplace(_addressMarketplace);
    landAddress = _addressLandToken;
    decentralandBid = _addressDecentralandBid;
    landRegistry = _addressLandRegistry;
    //decentralandBid = IBid(_decentralandBid);


  }

  function changeMaxLandOwners(uint8 maxLandOwners) external onlyOwner {

    require(maxLandOwners > 0, "You need a positive number of land owners");

    MAX_LAND_OWNERS = maxLandOwners;

  }

  function changeMaxLandSplits(uint16 max_land_splits) external onlyOwner {

    require(max_land_splits > 0, "You need a positive number of land splits");

    MAX_LAND_SPLITS = max_land_splits;

  }

  function changeBidDuration(uint256 maxBidDuration) external onlyOwner {

    require(maxBidDuration > 0, "The bid duration needs to be positive");

    BID_DURATION = maxBidDuration;

  }

  function changeNoActionCancelTime(uint256 _noActionCancelAfter) external onlyOwner {

    require(_noActionCancelAfter > 0, "_noActionCancelAfter has to be positive");

    NO_ACTION_CANCEL_BID_AFTER = _noActionCancelAfter;

  }

  function addSplitInvestor(address investor) internal {

    if (splitBalances[investor][MANA] == 0) {

      splitBalancesIndices.push(investor);

    }

  }

  function removeSplitInvestor(address investor) internal {

    uint length = splitBalancesIndices.length;

    for (uint i = 0; i < length; i++) {

      if(splitBalancesIndices[i] == investor){

        splitBalancesIndices[i] = splitBalancesIndices[length - 1];
        delete splitBalancesIndices[length - 1];
        splitBalancesIndices.length--;
        break;

      }

    }


  }

  function bidForLand(
    uint8 investmentType,
    uint256 landId,
    address[] calldata investors,
    uint256[] calldata _amountsInvested)
  external
  onlyOwner
  checkBeforeBuying(investmentType, investors.length,
    _amountsInvested.length, landId) {

    require(beingBid[landId] == false, "This LAND is already being bid on");

    beingBid[landId] = true;

    uint256 totalToInvest = computeTotalInvested(_amountsInvested);

    if (investmentType == 0) {

      require(wholeLandMANAFunds >= totalToInvest,
        "The is not enough MANA for whole investments");

      wholeLandMANAFunds = wholeLandMANAFunds.sub(totalToInvest);

      wholeBalances[investors[0]][MANA] =
      wholeBalances[investors[0]][MANA].sub(_amountsInvested[0]);

      lockedForBidding[investors[0]][MANA] =
      lockedForBidding[investors[0]][MANA].add(_amountsInvested[0]);

    } else if (investmentType == 1) {

      require(splitLandMANAFunds >= totalToInvest,
        "The is not enough MANA for split investments");

      splitLandMANAFunds = splitLandMANAFunds.sub(totalToInvest);

      for (uint j = 0; j < investors.length; j++) {

        splitBalances[investors[j]][MANA] =
        splitBalances[investors[j]][MANA].sub(_amountsInvested[j]);

        lockedForBidding[investors[j]][MANA] =
        lockedForBidding[investors[j]][MANA].add(_amountsInvested[j]);

      }

    }

    uint256 currentlyApproved =
    manaToken.allowance(address(this), decentralandBid);

    //Mitigate front-running
    manaToken.approve(decentralandBid, 0);

    //Allow the bid contract to get MANA from this contract
    manaToken.approve(decentralandBid,
      currentlyApproved.add(totalToInvest));

    bool status;
    bytes memory result;

    //Call the executeOrder function from the marketplace
    (status, result) = decentralandBid.call(
      abi.encode(
        bytes4(keccak256("placeBid(address, uint256, uint256, uint256)")),
        landAddress,
        landId,
        totalToInvest,
        BID_DURATION));

    /*decentralandBid.placeBid(
      landAddress,
      landId,
      totalToInvest,
      BID_DURATION
    );*/

    require(status == true, "Could not bid for LAND");

    //    bytes memory encodedInvestors =
    //    abi.encode(investors, _amountsInvested);
    //
    //    BidData memory newBid =
    //    BidData(encodedInvestors, landId, now, uint8(BID_RESULT.ONGOING));
    //
    //    bids.push(newBid);

    emit ProcessedBid(landId, totalToInvest, BID_DURATION);

  }

  function directBuyLand(
    uint8 _investmentType,
    uint256 _landId,
    address[] calldata _investors,
    uint256[] calldata _amountsInvested
  ) external onlyOwner checkBeforeBuying(_investmentType, _investors.length, _amountsInvested.length, _landId) {

    uint256 totalToInvest = computeTotalInvested(_amountsInvested);

    if (_investmentType == 0) {

      require(wholeLandMANAFunds >= totalToInvest,
        "The is not enough MANA for whole investments");

      wholeLandMANAFunds = wholeLandMANAFunds.sub(totalToInvest);

      wholeBalances[_investors[0]][MANA] = wholeBalances[_investors[0]][MANA].sub(_amountsInvested[0]);

    } else if (_investmentType == 1) {

      require(splitLandMANAFunds >= totalToInvest,
        "The is not enough MANA for split investments");

      splitLandMANAFunds = splitLandMANAFunds.sub(totalToInvest);

      for (uint j = 0; j < _investors.length; j++) {

        splitBalances[_investors[j]][MANA] = splitBalances[_investors[j]][MANA].sub(_amountsInvested[j]);

        if(splitBalances[_investors[j]][MANA] == 0){

          removeSplitInvestor(_investors[j]);

        }

      }

    }

    // Mitigate front-running
    manaToken.approve(address(marketplace), 0);

    // Allow the bank contract to get MANA from this contract
    manaToken.approve(address(marketplace), totalToInvest);

    // Call the executeOrder from the marketplace
    marketplace.executeOrder(landAddress, _landId, totalToInvest);

    landIsInBank[_landId] = true;

    bytes memory encodedInvestors = abi.encode(_investors, _amountsInvested);

    unassignedLand[_landId] = encodedInvestors;

    assignLand(_landId);
    emit BoughtLand(_landId);

  }

  function assignLand(uint256 unassignedLandId) public onlyOwner {

    require(keccak256(unassignedLand[unassignedLandId]) != keccak256(nullBytes),
      "This land was already assigned");

    require(landIsInBank[unassignedLandId] == true, "The LAND is not owned by this contract");

    address[] memory investors;
    uint256[] memory money;

    (investors, money) =
    abi.decode(unassignedLand[unassignedLandId],
      (address[], uint256[]));

    require(investors.length >= 1
    && money.length >= 1
    && money.length == investors.length,
      "The arrays do not have valid lengths");

    unassignedLand[unassignedLandId] = nullBytes;

    if (investors.length == 1) {

      landIsInBank[unassignedLandId] = false;

      bool status;
      bytes memory result;

      //Call the executeOrder function from the marketplace
      (status, result) = landRegistry.call(
        abi.encode(
          bytes4(keccak256("transferFrom(address, address, uint256)")),
          address(this),
          investors[0],
          unassignedLandId));

      require(status == true, "Could not transfer the whole LAND to the investor");

      emit TransferredUnassignedLand(investors[0], unassignedLandId);

    } else {

      ISplitLand newSplitLand = new SplitLand(investors, money, MAX_LAND_SPLITS, unassignedLandId);

      Land memory newLandData = Land(newSplitLand, MAX_LAND_SPLITS);

      landDetails[unassignedLandId] = newLandData;

      emit SplitUnassignedLand(address(newSplitLand), unassignedLandId, MAX_LAND_SPLITS);

    }

  }

  function depositMANA(uint8 _balanceType, address _target, uint256 _amount) external {

    require(manaToken.balanceOf(msg.sender) >= _amount,
      "You do not have that much MANA to deposit");

    require(_balanceType == 0 || _balanceType == 1, "The balance type needs to be 0 or 1");

    manaToken.transferFrom(msg.sender, address(this), _amount);

    if (_balanceType == 0) {

      wholeBalances[_target][MANA] = wholeBalances[_target][MANA].add(_amount);

      wholeLandMANAFunds = wholeLandMANAFunds.add(_amount);

    } else {

      addSplitInvestor(_target);
      splitBalances[_target][MANA] = splitBalances[_target][MANA].add(_amount);

      splitLandMANAFunds = splitLandMANAFunds.add(_amount);

    }

    emit DepositedMANA(_balanceType, msg.sender, _target, _amount);

  }

  function withdrawMANA(uint8 _balanceType, uint256 _amount) external {

    require(_balanceType == 0 || _balanceType == 1, "The balance type needs to be 0 or 1");

    if (_balanceType == 0) {

      require(wholeBalances[msg.sender][MANA] >= _amount,
        "You do not have that much MANA for whole investments");

      wholeBalances[msg.sender][MANA] = wholeBalances[msg.sender][MANA].sub(_amount);

      wholeLandMANAFunds = wholeLandMANAFunds.sub(_amount);

    } else {

      require(splitBalances[msg.sender][MANA] >= _amount,
        "You do not have that much MANA for split investments");

      splitBalances[msg.sender][MANA] = splitBalances[msg.sender][MANA].sub(_amount);

      splitLandMANAFunds = splitLandMANAFunds.sub(_amount);

      if(splitBalances[msg.sender][MANA] == 0){

        removeSplitInvestor(msg.sender);

      }

    }

    require(manaToken.transfer(msg.sender, _amount) == true,
      "Could not transfer funds in the withdraw function");

    emit WithdrewMANA(_balanceType, msg.sender, _amount);

  }

  function registerBidResult(
    uint8 result,
    uint256 bidPosition)
  external onlyOngoingBid(bidPosition) {

    require(result <= 3 && result > 0, "The result is not within bounds");

    bids[bidPosition].bidStatus = result;

    address[] memory investors;
    uint256[] memory money;

    (investors, money) =
    abi.decode(bids[bidPosition].bidData,
      (address[], uint256[]));

    if (result == uint8(BID_RESULT.CANCELLED) ||
    result == uint8(BID_RESULT.FAILED)) {

      if (investors.length == 1) {

        lockedForBidding[investors[0]][MANA] =
        lockedForBidding[investors[0]][MANA].sub(money[0]);

        wholeBalances[investors[0]][MANA] =
        wholeBalances[investors[0]][MANA].add(money[0]);

      } else {

        for (uint i = 0; i < investors.length; i++) {

          lockedForBidding[investors[i]][MANA] =
          lockedForBidding[investors[i]][MANA].sub(money[i]);

          splitBalances[investors[i]][MANA] =
          splitBalances[investors[i]][MANA].add(money[i]);

        }

      }

    } else if (result == uint8(BID_RESULT.SUCCESSFUL)) {

      for (uint i = 0; i < investors.length; i++) {

        lockedForBidding[investors[i]][MANA] =
        lockedForBidding[investors[i]][MANA].sub(money[i]);

      }

      landIsInBank[bids[bidPosition].landId] = false;

      unassignedLand[bids[bidPosition].landId] = bids[bidPosition].bidData;

    }

    beingBid[bids[bidPosition].landId] = false;

    emit RegisteredBidResult(result, bidPosition);

  }

  function generalSplitLand(
    uint256 _tokenId,
    uint256 landParts)
  external {



  }

  function reconstructLand(
    uint256 id,
    address reconstructedLandReceiver)
  external {



  }

  function cancelBidAfterNoAction(
    uint256 bidPosition
  ) external onlyOngoingBid(bidPosition) {

    require(bids[bidPosition].creationTimestamp
    + NO_ACTION_CANCEL_BID_AFTER * 1 seconds < now,
      "Not enough time went by since the creation of the bid");

    bids[bidPosition].bidStatus = uint8(BID_RESULT.CANCELLED);

    address[] memory investors;
    uint256[] memory money;

    (investors, money) =
    abi.decode(bids[bidPosition].bidData,
      (address[], uint256[]));

    if (investors.length == 1) {

      lockedForBidding[investors[0]][MANA] =
      lockedForBidding[investors[0]][MANA].sub(money[0]);

      wholeBalances[investors[0]][MANA] =
      wholeBalances[investors[0]][MANA].add(money[0]);

    } else {

      for (uint i = 0; i < investors.length; i++) {

        lockedForBidding[investors[i]][MANA] =
        lockedForBidding[investors[i]][MANA].sub(money[i]);

        splitBalances[investors[i]][MANA] =
        splitBalances[investors[i]][MANA].add(money[i]);

      }

    }

    beingBid[bids[bidPosition].landId] = false;

  }

  //PRIVATE

  function computeTotalInvested(uint256[] memory _amountsInvested) private pure returns (uint256) {

    uint256 totalToInvest = 0;

    for (uint i = 0; i < _amountsInvested.length; i++) {

      totalToInvest = totalToInvest.add(_amountsInvested[i]);

    }

    return totalToInvest;

  }

  //GETTERS

  function getSplitInvestorsData() public view returns (address[] memory investorsAddress, uint256[] memory amountInvested) {

    uint length = splitBalancesIndices.length;

    address[] memory investorsAddress = new address[](length);
    uint256[] memory amountInvested = new uint256[](length);

    for (uint i = 0; i < length; i++) {

      address investor = splitBalancesIndices[i];
      uint256 balance = splitBalances[investor][MANA];
      investorsAddress[i] = investor;
      amountInvested[i] = balance;

    }

    return (investorsAddress, amountInvested);

  }

  function getLandTokenSplitAddress(
    uint256 landID
  ) public view returns (address) {

    return address(landDetails[landID].splitLandToken);

  }

  function getDepositedLandParts(
    uint256 landID
  ) public view returns (uint256) {

    return landDetails[landID].parts;

  }

  function getSplitBalance(
    address who
  ) public view returns (uint256) {

    return splitBalances[who][MANA];

  }

  function getWholeBalance(
    address who,
    bytes32 hashedCoinTicker
  ) public view returns (uint256) {

    return wholeBalances[who][hashedCoinTicker];

  }

  function getLockedFunds(
    address who,
    bytes32 coinTicker
  ) public view returns (uint256) {

    return lockedForBidding[who][coinTicker];

  }

  function landIsBeingBid(
    uint256 landId
  ) public view returns (bool) {

    return beingBid[landId];

  }

  function getBidInvestorData(
    uint256 position
  ) public view returns (bytes memory) {

    return bids[position].bidData;

  }

  function getBidStatus(
    uint256 position
  ) public view returns (uint8) {

    return bids[position].bidStatus;

  }

  function onERC721Received(
    address _operator,
    address _from,
    uint256 _tokenId,
    bytes memory _data
  ) public returns (bytes4) {

    return ERC721_RECEIVED;

  }

}
