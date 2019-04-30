pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract ICreditScoring is Ownable {

  event SetCardOption(string elementName, uint256 elementOption, int256 score);
  event ToggledCoin(address _coin);
  event ChangedMaxRequestAvailability(uint256 _availability);
  event ChangedMaxBorrowedPoints(uint256 _points);
  event UpdatedScore(address _user, int256 _newScore, string ipfsProof);
  event UserRegistered(address _user);
  event RequestedCreditPoints(address _user, uint256 _lendingDuration,
    uint256 pointsToBorrow, address coinOffered, uint256 coinAmountOffered);
  event FilledRequest(address _lender, uint256 requestPosition);
  event CancelledRequest(address borrower, uint256 position);
  event ChangedRequestCoinOffered(uint256 position, address newCoin);
  event ChangedRequestCoinAmountOffered(uint256 position, uint256 coinAmount);
  event PaidBack(address _caller, uint256 request, uint256 coinAmount, uint256 totalPaidBack);
  event GotBackCollateral(address caller, uint256 requestPosition);
  event PunishedBorrower(address caller, uint256 requestPosition);

  enum BACKING_TYPE {ERC20, ERC721}

  enum REQUEST_STATUS {STARTED, CANCELLED, CREATED, FINISHED}

  struct CreditRequest {

    //ASK

  /*
    //What type of collateral the borrower deposited (ERC721 or ERC20)
    uint8 borrowerBackingType;

    //How many credit points the borrower wants
    uint256 borrowedPoints;

    //In case the collateral is ERC20, we specify how much of the coin is staked
    uint256 borrowerBackingAmount;

    //Serialized array of uint256 symbolizing ERC721 token ids; the serialization is done with the "encode" function from web3js
    bytes borrowerUniqueBackingIds;

    //The address of the coin used as collateral
    address borrowerBackingLocation;
  */

    //OFFER

  /*

    //The address of the ERC20 token offered as payment to the lender
    address coinOffered;

    //How many ERC20 tokens will be paid for the credit points borrowed
    uint256 coinAmountOffered;

  */

    uint8 requestStatus;

    //When the request was created
    uint256 creationTime;

    //How many seconds a borrower wants to keep the credit points
    uint256 lendingDuration;

    address borrower;

    address lender;

    //How many credit points the borrower wants
    uint256 borrowedPoints;

    //The address of the ERC20 token offered as payment to the lender
    address coinOffered;

    //How many ERC20 tokens will be paid for the credit points borrowed
    uint256 coinAmountOffered;

    uint256 paidBack;

    /**
    * The encoded ASK params
    * (borrowerBackingType, borrowedPoints, borrowerBackingAmount,
    * borrowerUniqueBackingIds, borrowerBackingLocation)
    **/
    //bytes askData;

    /**
    * The encoded OFFER params
    * (coinOffered, coinAmountOffered)
    **/
    //bytes offerData;

  }

  struct User {

    //The personal credit score of a user
    int256 personalScore;

    //How many points this user borrowed since the beginning of their activity
    uint256 currentlyBorrowedPoints;

    //How many points this user lent since the beginning of their activity
    uint256 allTimeLentPoints;

    uint256 allTimeBorrowedPoints;

    //How many points this user is lending right now
    uint256 currentlyLentPoints;

  }

  address constant public ETH_ADDRESS = address(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

  //Set this to 4 weeks in the constructor and we can change it with a function
  uint256 public maxRequestAvailability;

  //Minimum amount of time that needs to pass until someone can cancel a request; set this to around 3 days
  uint256 public minCancelRequestDelay;

  //Set to something like 100 in the constructor; denoted maximum amount of credit points someone can have borrowed at one time
  uint256 public MAX_BORROWED_CREDIT_POINTS;

  //Set to something like 50 in the constructor; denoted maximum amount of credit points someone can have lent at one time
  uint256 public MAX_LENT_CREDIT_POINTS;

  /*
  * The borrower needs to wait at least this many seconds after a
  * filled request matures so they can be punished in case they used credit points
  * to do something reckless
  */
  uint256 public WAIT_FOR_COLLATERAL_RETREIVAL;

  //How many seconds an address can keep some borrowed credit points
  uint256 public BORROWED_KEEPING_TIME_LIMIT;

  /**
  *  After the contract is initialized, we need to setup the scorecard as detailed at:
  *  http://tiny.cc/oeba5y
  *  For example, for Deposit history and option 0 - 5 weeks we have
  *  scorecard["DEPOSIT_HISTORY"][1] which equals 55
  *  For Deposit history and option 6 - 10 weeks we have
  *  scorecard["DEPOSIT_HISTORY"][2] which equals 30
  **/
  mapping(string => mapping(uint256 => int256)) scorecard;

  mapping(address => bool) whitelistedCoins;

  mapping(address => User) users;

  mapping(address => bool) userExists;

  CreditRequest[] public creditRequests;

  //needs onlyOwner

  /**
  * @dev Set points for a certain criteria and a level as outlined here:
  *      http://tiny.cc/oeba5y
  *
  * @param elementName - A string denoting the criteria. Ex: "Deposit history",
                         "Investing history length"
  * @param elementOption - The level for a criteria. Ex: for Deposit history
                           there are 5 different levels, so we can make
                           elementOption any number between 0 - 4
  * @param score - The points given for the level on this criteria
  **/

  function setCardOption(
    string calldata elementName,
    uint256 elementOption,
    int256 score
  ) external;

  //needs onlyOwner

  /**
  * @dev Whitelist a coin to be used as collateral or as payment for lending credit points.
         If a coin is already set to true, it will be set to false and vice-versa

  * @param coin - The address of the token contract we toggle
  **/

  function toggleWhitelistedCoin(
    address coin
  ) external;

  //needs onlyOwner

  /**
  * @dev Set how many seconds any request can stay active from its creation onward

  * @param _secondAmount - Number of seconds
  **/

  function changeMaxRequestAvailability(
    uint256 _secondAmount
  ) external;

  //needs onlyOwner

  /**
  * @dev How many credit points an address can borrow at any time

  * @param points - The max number of credit points an address can borrow at any point in time
  **/

  function changeMaxBorrowedPoints(
    uint256 points
  ) external;

  /**
  * @dev Get your credit score. The first array gives the categories, the second
         one gives the level where the caller is at for each category.
         For example, if we determine off-chain that the user has the following:

         Deposit history: 6 - 10 weeks
         Investing history length: Below 6 months - 10 points
         Bank spam: 0
         Mortgages seeked in the last 6 months: 2 - 5
         Outstanding debt: 501 - 10K MANA
         Times defaulted: 0 times

         then the user would need to pass the arrays:

         ["DEPOSIT HISTORY", "INVESTING HISTORY LENGTH", "BANK SPAM", "MORTGAGES SEEKED IN THE LAST 6 MONTHS", "OUTSTANDING DEBT", "TIMES DEFAULTED"]
         [2, 1, 0, 1, 2, 0]

         The function (for now) simply returns the sum of the points
         mapped to each level from each category minus points lent plus points borrowed. In this case,

         30 + 10 + 30 + 30 + 20 + 70 = 190 (credit points)

  * @param _user - The _user for which the score is being computed
  * @param categories - The array of categories taken into account
  * @param elements - The array of levels for each category as explained above

  **/

  function computeCreditScore(
    address _user,
    string[] calldata categories,
    uint256[] calldata elements)
    external view returns (int256);

  //needs onlyOwner

  /**
  * @dev This function does the same thing as computeCreditScore but with an addition.
         It stores the score in the personalScore field inside the user's struct.
         Note that only the owner can call this because a user can put random numbers
         in the elements array and artificially boost their score. As a proof to show
         that they chose the correct params in the elements array, the owner
         needs to specify an IPFS address where the credit data for an address is stored
         and acts as proof.

  * @param user - The address of the user we compute for
  * @param elements - The array of levels for each category as explained in computeCreditScore
  * @param ipfsCreditDataProof - IPFS hash pointing to credit data that serves as proof
                                 ipfsCreditDataProof needs to be emitted in an event

  **/

  function computeAndUpdateScore(
    address user,
    string[] calldata categories,
    uint256[] calldata elements,
    string calldata ipfsCreditDataProof
  ) external;

  /**
  * @dev A user can register themselves in the CreditScoring contract.
         Registration is needed to initialize the user's struct where we store
         their data.

  * @param _user - If the owner is calling this function, they can register
                   a user without the user paying gas fees
  **/

  function registerUser(address _user) external;

  /**
  * @dev Request credit points. Alternatively the owner can request points on behalf of a user

  * @param _lendingDuration - How many seconds this address wants to keep the borrowed points
  * @param pointsToBorrow - How many points _user wants to borrow
  * @param coinOffered - The ERC20 coin offered as interest payment
  * @param coinAmountOffered - The amount of ERC20 coins offered
  **/

  function requestCreditPoints(
    address _user,
    uint256 _lendingDuration,
    uint256 pointsToBorrow,
    address coinOffered,
    uint256 coinAmountOffered
  ) external;

  /**
  * @dev Fill a credit points request. We need to check that the lender is currently
         lending at max MAX_LENT_CREDIT_POINTS and they are not going above the
         limit by also lending for this request. The number of points being
         asked for in the request will be decreased from the lender's personalScore
         and increased in their currentlyLentPoints

  * @param position - The position of the request in creditRequests
  **/

  function fillRequest(uint256 position) external;

  /**
  * @dev Cancel a request. Only the creator can cancel. Also the creator cannot
         cancel if a request has already been filled. Finally, the creator needs
         to wait minCancelRequestDelay seconds since the creation of the request
         in order to cancel it
  **/

  function cancelRequest(
    uint256 position
  ) external;

  /**
  * @dev Change the address of the token offered to the lender in exchange
         for their credit points

  * @param position - The position of the request in creditRequests
  * @param newCoinOffered - The address of the new ERC20 offered; the ERC20 needs to be whitelisted
  **/

  function changeRequestCoinOffered(
    uint256 position,
    address newCoinOffered
  ) external;

  /**
  * @dev Change how many ERC20 coins the borrower offers for credit points

  * @param position - The position of the request in creditRequests
  * @param coinAmount - New ERC20 amount to be paid toward the lender
  **/

  function changeRequestCoinAmountOffered(
    uint256 position,
    uint256 coinAmount
  ) external;

  /**
  * @dev Pay ERC20 tokens to fulfill a request filled by a lender for you.
         The caller needs to approve this contract to transfer the correct
         ERC20 token to the lender. Also the caller does not necessarily
         need to be the borrower. The caller can pay at max how many tokens
         were specified in the request. The caller does not need to pay
         everything at once.

  * @param position - The position of the request in
  * @param _coinAmount - How many ERC20 tokens are being sent to the lender
  **/

  function payBackDebt(
    uint256 position,
    uint256 _coinAmount
  ) external;

  /**
  * @dev The borrower can get back their collateral only if:

        * They paid all the necessary ERC20 tokens to the lender
        * They waited at least WAIT_FOR_COLLATERAL_RETREIVAL seconds after the request reached maturity

  * @param position - The position of the request in creditRequests
  **/

  function borrowerGetBackCollateral(
    uint256 position
  ) external;

  /**
  * @dev The lender can confiscate the borrower's collateral in case they didn't
         pay all the ERC20 tokens until the request reached maturity

  * @param position - The position of the request in creditRequests
  **/

  function punishBorrowerNonPayment(
    uint256 position
  ) external;

}
