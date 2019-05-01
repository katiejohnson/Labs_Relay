pragma solidity 0.5.7;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "openzeppelin-solidity/contracts/token/ERC721/IERC721Receiver.sol";
import "../interfaces/decentraland/IMarketplace.sol";
import "./ISplitLand.sol";

contract IBank is IERC721Receiver {

  //Functions having onlyOwner are managed by our backend

  event ProcessedBid(uint256 landId, uint256 totalBid, uint256 duration);
  event BoughtLand(uint256 landId);
  event DepositedMANA(uint8 depositType, address caller, address target, uint256 amount);
  event WithdrewMANA(uint8 depositType, address caller, uint256 amount);
  event RegisteredBidResult(uint8 result, uint256 bidPosition);
  event SplitUnassignedLand(address _tokenAddress, uint256 _tokenId, uint256 parts);
  event TransferredUnassignedLand(address to, uint256 tokenId);
  event SplitExternalLand(address owner, address _tokenAddress,
    uint256 _tokenId, uint256 parts);
  event ReconstructedLand(uint256 id, address caller, address reconstructedLandReceiver);

  struct Land {

    ISplitLand splitLandToken;

    uint256 parts;

  }

  struct BidData {

    bytes bidData;

    uint256 landId;

    uint256 creationTimestamp;

    uint8 bidStatus;

  }

  //Hashed tickers used in splitBalances and wholeBalances
  bytes32 public MANA;

  //How many land owners can pool money together at once in order to bid
  uint8 public MAX_LAND_OWNERS;

  //Maximum number of pieces a patch of LAND can be split in
  uint16 public MAX_LAND_SPLITS;

  //When submitting a bid, we specify this duration (which is 1 day less than max amount permitted)
  uint256 public BID_DURATION;

  //The amount of time needs to pass since we locked some investor money for a bid but we did not update the bid status so it can be cancelled and investors get their money back
  uint256 public NO_ACTION_CANCEL_BID_AFTER;

  //How much MANA was deposited for buying whole plots of LAND without splitting
  uint256 public wholeLandMANAFunds;

  //How much MANA was deposited for buying whole plots of LAND and then split them
  uint256 public splitLandMANAFunds;

  //Address of MANA token
  IERC20 manaToken;

  // Land marketplace
  Marketplace marketplace;

  //Land registry address
  address landRegistry;

  //The address of the LAND ERC721
  address landAddress;

  /**
  *  When submitting a bid we lock up the funds of the investors we take money from.
  *  In order for them to get their money back in case we don't update the bid status
  *  for a specific bid, we abi.encode the investors and _amountsInvested
  *  and store the resulting bytes in a Bid struct alongside the current timestamp
  *  and the ONGOING status
  **/
  BidData[] bids;

  //Some people want to let us invest for them but only want a fraction of LAND
  mapping(address => mapping(bytes32 => uint256)) splitBalances;

  //Indices list for splitBalances
  address[] splitBalancesIndices;

  //Others want to let us invest for them and target whole plots of LAND
  mapping(address => mapping(bytes32 => uint256)) wholeBalances;

  //Funds already used in a bid
  mapping(address => mapping(bytes32 => uint256)) lockedForBidding;

  //LAND id being bid on by us
  mapping(uint256 => bool) beingBid;

  //Details for LAND token deposited in this contract and split; mapping LAND token id to Land struct
  mapping(uint256 => Land) landDetails;

  //Telling if a LAND is in the Bank
  mapping(uint256 => bool) landIsInBank;

  mapping(uint256 => bytes) unassignedLand;

  enum BID_RESULT {ONGOING, SUCCESSFUL, FAILED, CANCELLED}

  enum BALANCE_TYPE {SPLIT, WHOLE}

  enum INVESTMENT_TYPE {WHOLE, SPLIT}

  function getSplitInvestorsData() public view returns (
    address[] memory investorsAddress,
    uint256[] memory amountInvested
  );

  function getLandTokenSplitAddress(
    uint256 landID
  ) public view returns (address);

  function getDepositedLandParts(
    uint256 landID
  ) public view returns (uint256);

  function getSplitBalance(
    address who
  ) public view returns (uint256);

  function getWholeBalance(
    address who,
    bytes32 hashedCoinTicker
  ) public view returns (uint256);

  function getLockedFunds(
    address who,
    bytes32 coinTicker
  ) public view returns (uint256);

  function landIsBeingBid(
    uint256 landId
  ) public view returns (bool);

  function getBidInvestorData(
    uint256 position
  ) public view returns (bytes memory);

//  function getBidCreation(
//    uint256 position
//  ) public view returns (uint256);

  function getBidStatus(
    uint256 position
  ) public view returns (uint8);

  //needs onlyOwner

  /**
  * @dev Bid for land using the Decentraland Bid contract.
         Our backend monitors this smart contract and
         uses the balances that investors entrusted us with to bid for
         the best LAND we can find for sale. We are effectively an investment
         fund for millenials and Gen Zs. They simply send money to this
         contract and we take care to invest it

  *  In the investors array we cannot mix those who want only a fraction
     of LAND and those who want a whole plot

  * @param investmentType - SPLIT or WHOLE (we will divide the LAND or we give the entire LAND to one entity)
  * @param landId - The id of the LAND we want to invest in
  * @param investors - The addresses whose funds we will use to bid
  * @param _amountsInvested - The amount we use from each investor's balance
  */
  function bidForLand(
    uint8 investmentType,
    uint256 landId,
    address[] calldata investors,
    uint256[] calldata _amountsInvested)
  external;

  /**
  * Buy land directly without going through the bid process.
  * Params are similar to bidForLand apart from marketplace which is the contract
  * where we can buy LAND directly
  **/
  function directBuyLand(
    uint8 investmentType,
    uint256 landId,
    address[] calldata investors,
    uint256[] calldata _amountsInvested
  ) external;

  //Needs onlyOwner

  /**
  * This function is used to assign land after buying it

  * @param unassignedLandId - The id of the LAND which is not assigned
  **/

  function assignLand(uint256 unassignedLandId) external;

  /**
  * @dev Entrust the contract with MANA so it can be invested for you or for someone you deposit for
  * @param balanceType - 0 or 1 (SPLIT OR WHOLE)
  * @param _target - Who receives the MANA in their balance
  * @param _amount - How much MANA is deposited
  **/
  function depositMANA(uint8 balanceType, address _target, uint256 _amount) external;

  /**
  * @dev Withdraw MANA from the contract
  * @param balanceType - 0 or 1 (SPLIT OR WHOLE)
  * @param _amount - How much MANA is being withdrawn
  **/
  function withdrawMANA(uint8 balanceType, uint256 _amount) external;

  /**
  * @dev Register the result of a bid.
         If unsuccessful, transfer funds from locked to either split or
         whole balances. If we want to cancel, call the cancelLandBid
         function and send funds from locked to normal balances.
         If successful and the investors we took money from wanted SPLIT,
         we decrease the amounts from lockedForBidding and we create a
         new SplitLand ERC20 contract where we distribute LAND parts to
         investors. If the investment type is WHOLE, we just send the entire
         LAND to the investor. When distributing LAND parts, each investor
         will get a proportional amount of LAND parts according to how much
         money we used from their balance, compared to total amount invested
         in that LAND.

  * @param result - It can be 0, 1 or 2 (SUCCESSFUL, FAILED, CANCELLED)
  * @param bidPosition - The position of the bid in the bids array
  **/

  //needs onlyOwner

  function registerBidResult(
    uint8 result,
    uint256 bidPosition)
  external;

  /**
  * @dev Allow anyone to deposit a LAND token in this contract and create
         a SplitLand ERC20 contract where all the LAND parts are assigned
         in the constructor to msg.sender. The LAND token deposited in this contract
         cannot be transferred elsewhere unless someone has all the LAND parts
         in the balance in the SplitLand contract and calls reconstructLand.

         When creating a new SplitContract, create a new Land struct with
         the address of the new contract and how many portions of LAND
         were created.

  * @param _tokenId - The id of the LAND we want to invest in
  * @param landParts - Needs to be less than or equal to MAX_LAND_SPLITS
                       Tells the newly created SplitLand contract in how
                       many smaller parts we divided the LAND
  **/
  function generalSplitLand(
    uint256 _tokenId,
    uint256 landParts)
  external;

  /**
  * @dev Reconstruct and entire LAND token from the LAND parts in a SplitLand
         contract and then send the LAND to reconstructedLandReceiver.
         The msg.sender needs to have all the LAND parts in their balance inside
         the SplitLand contract.

  * @param id - The id of the LAND token the caller wants to reconstruct
  * @param reconstructedLandReceiver - The receiver of the reconstructed LAND token
  **/
  function reconstructLand(
    uint256 id,
    address reconstructedLandReceiver)
  external;

  /**
  * @dev Cancel a bid if it hasn't been updated for the time specified in NO_ACTION_CANCEL_BID_AFTER
  *      This function should decode the bytes value, get the investors and amounts arrays,
         and send the money out of this contract and back to the investors. Remember to decrease the
         lockedForBidding value for each investor! Also update the bid status to CANCELLED

  * @param bidPosition - The position of the bid in the bids array
  **/
  function cancelBidAfterNoAction(
    uint256 bidPosition
  ) external;

}
