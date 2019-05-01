pragma solidity 0.5.7;
pragma experimental ABIEncoderV2;

import "./.././interfaces/ICreditScoring.sol";
import "../../node_modules/openzeppelin-solidity/contracts/utils/Address.sol";
import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract CreditScoring is ICreditScoring {

  using Address for address;
  using SafeMath for uint256;

  constructor(
    uint256 _maxRequestAvailability,
    uint256 _minCancelRequestDelay,
    uint256 _MAX_BORROWED_CREDIT_POINTS,
    uint256 _MAX_LENT_CREDIT_POINTS,
    uint256 _WAIT_FOR_COLLATERAL_RETREIVAL,
    uint256 _BORROWED_KEEPING_TIME_LIMIT
  ) public {

    require(_maxRequestAvailability > 0,
      "The request availability needs to be a positive number");

    require(_minCancelRequestDelay > 0,
      "The cancel request delay needs to be a positive number");

    require(_MAX_BORROWED_CREDIT_POINTS > 0,
      "The max borrowed credit points needs to be a positive number");

    require(_MAX_LENT_CREDIT_POINTS > 0,
      "The max lent credit points needs to be a positive number");

    require(_WAIT_FOR_COLLATERAL_RETREIVAL > 0,
      "The wait for collateral needs to be a positive number");

    require(_BORROWED_KEEPING_TIME_LIMIT > 0,
      "The keeping time limit needs to be a positive number");

    maxRequestAvailability = _maxRequestAvailability;
    minCancelRequestDelay = _minCancelRequestDelay;
    MAX_BORROWED_CREDIT_POINTS = _MAX_BORROWED_CREDIT_POINTS;
    MAX_LENT_CREDIT_POINTS = _MAX_LENT_CREDIT_POINTS;
    WAIT_FOR_COLLATERAL_RETREIVAL = _WAIT_FOR_COLLATERAL_RETREIVAL;
    BORROWED_KEEPING_TIME_LIMIT = _BORROWED_KEEPING_TIME_LIMIT;

  }

  function setCardOption(
    string calldata elementName,
    uint256 elementOption,
    int256 score
  ) external onlyOwner {

    scorecard[elementName][elementOption] = score;

    emit SetCardOption(elementName, elementOption, score);

  }

  function toggleWhitelistedCoin(
    address coin
  ) external onlyOwner {

    whitelistedCoins[coin] = !whitelistedCoins[coin];

    emit ToggledCoin(coin);

  }

  function changeMaxRequestAvailability(
    uint256 _availability
  ) external onlyOwner {

    emit ChangedMaxRequestAvailability(_availability);

  }

  function changeMaxBorrowedPoints(
    uint256 points
  ) external onlyOwner {

    emit ChangedMaxBorrowedPoints(points);

  }

  function computeCreditScore(
    address _user,
    string[] calldata categories,
    uint256[] calldata levels)
    external view returns (int256) {

    if (categories.length != levels.length ||
        categories.length == 0 ||
        userExists[_user] == false) return 0;

    int256 score = 0;

    for (uint i = 0; i < levels.length; i++) {

      score += scorecard[categories[i]][levels[i]];

    }

    return score;

  }

  function computeAndUpdateScore(
    address user,
    string[] calldata categories,
    uint256[] calldata elements,
    string calldata ipfsCreditDataProof
  ) external onlyOwner {

    require(categories.length == elements.length,
      "The arrays do not have the same length");

    require(categories.length > 0, "The arrays need to have elements in them");

    require(users[user].currentlyLentPoints == 0, "The user needs to have 0 points being lent");

    int256 score = 0;

    for (uint i = 0; i < elements.length; i++) {

      score += scorecard[categories[i]][elements[i]];

    }

    if (userExists[user] == false) {

      userExists[user] = true;

      User memory newUser = User(score, 0, 0, 0, 0);

      users[user] = newUser;

      emit UserRegistered(user);

    } else {

      users[user].personalScore = score;

    }

    emit UpdatedScore(user, score, ipfsCreditDataProof);

  }

  function registerUser(address _user) external {

    if (msg.sender != owner())
      require(msg.sender == _user,
        "Cannot register other addresses if you are not the owner");

    require(userExists[_user] == false, "The user already exists");

    userExists[_user] = true;

    User memory newUser = User(0, 0, 0, 0, 0);

    users[_user] = newUser;

    emit UserRegistered(_user);

  }

  function requestCreditPoints(
    address _user,
    uint256 _lendingDuration,
    uint256 pointsToBorrow,
    address coinOffered,
    uint256 coinAmountOffered
  ) external {

    if (msg.sender != owner())
      require(msg.sender == _user,
        "Cannot request for other addresses if you are not the owner");

    require(users[_user].currentlyBorrowedPoints.add(pointsToBorrow) <= MAX_BORROWED_CREDIT_POINTS,
      "_user cannot borrow that many points right now");

    require(users[_user].currentlyBorrowedPoints.add(pointsToBorrow) <= MAX_LENT_CREDIT_POINTS,
      "_user cannot borrow more than MAX_LENT_CREDIT_POINTS");

    require(users[_user].personalScore >= 0, "_user needs to have a positive score");

    require(_lendingDuration <= BORROWED_KEEPING_TIME_LIMIT,
      "_user cannot hold points for that long");

    require(whitelistedCoins[coinOffered] == true, "The coin offered is not whitelisted");

    ERC20 coinToOffer = ERC20(coinOffered);

    require(coinToOffer.allowance(_user, address(this)) >= coinAmountOffered,
      "_user did not allow this contract to transfer that many coins");

    CreditRequest memory request = CreditRequest(
      2,
      now,
      _lendingDuration,
      _user,
      address(0),
      pointsToBorrow,
      coinOffered,
      coinAmountOffered,
      0
    );

    creditRequests.push(request);

    require(coinToOffer.transferFrom(_user, address(this), coinAmountOffered));

    emit RequestedCreditPoints(_user, _lendingDuration,
      pointsToBorrow, coinOffered, coinAmountOffered);

  }

  function fillRequest(uint256 position) external {

    require(creditRequests.length > position, "The position is not within bounds");

    require(creditRequests[position].requestStatus == 2, "The request needs to be CREATED");

    require(creditRequests[position].borrower != msg.sender, "The borrower cannot also be the lender");

    require(creditRequests[position].creationTime.add(maxRequestAvailability) > now,
      "The request expired");

    require(users[creditRequests[position].borrower]
      .currentlyBorrowedPoints.add(creditRequests[position].borrowedPoints)
      <= MAX_BORROWED_CREDIT_POINTS,
      "The borrower cannot borrow that many points right now");

    creditRequests[position].requestStatus = 0;
    creditRequests[position].lender = msg.sender;

    users[creditRequests[position].borrower].currentlyBorrowedPoints =
      users[creditRequests[position].borrower]
      .currentlyBorrowedPoints.add(creditRequests[position].borrowedPoints);

    users[creditRequests[position].borrower].allTimeBorrowedPoints =
      users[creditRequests[position].borrower].allTimeBorrowedPoints
      .add(creditRequests[position].borrowedPoints);

    if (msg.sender != owner()) {

      require(userExists[msg.sender] == true, "The filler must be registered");

      require(users[msg.sender].personalScore
          - int256(creditRequests[position].borrowedPoints) > 0, "The filler does not have enough points");

      require(users[msg.sender]
              .currentlyLentPoints
              .add(creditRequests[position].borrowedPoints)
              <= MAX_LENT_CREDIT_POINTS, "The filler cannot lend that many points now");

      users[msg.sender].currentlyLentPoints =
        users[msg.sender].currentlyLentPoints.add(creditRequests[position].borrowedPoints);

      users[msg.sender].allTimeLentPoints =
        users[msg.sender].allTimeLentPoints.add(creditRequests[position].borrowedPoints);

      users[msg.sender].personalScore =
        users[msg.sender].personalScore - int256(creditRequests[position].borrowedPoints);

    }

    emit FilledRequest(msg.sender, position);

  }

  function cancelRequest(
    uint256 position
  ) external {

    require(creditRequests.length > position, "The position needs to be between bounds");

    require(creditRequests[position].creationTime.add(minCancelRequestDelay) < now,
      "You need to wait more until you can cancel the request");

    require(creditRequests[position].requestStatus == 2, "The request needs to be CREATED");

    require(creditRequests[position].borrower == msg.sender,
        "The borrower needs to be the caller");

    require(creditRequests[position].lender == address(0), "There must be no lender assigned");

    creditRequests[position].requestStatus = 1;

    emit CancelledRequest(msg.sender, position);

  }

  function changeRequestCoinOffered(
    uint256 position,
    address newCoinOffered
  ) external {

    require(creditRequests.length > position, "The position needs to be between bounds");

    require(creditRequests[position].requestStatus == 2, "The request needs to be CREATED");

    require(creditRequests[position].borrower == msg.sender,
        "The borrower needs to be the caller");

    require(whitelistedCoins[newCoinOffered] == true, "The new coin is not whitelisted");

    creditRequests[position].coinOffered = newCoinOffered;

    emit ChangedRequestCoinOffered(position, newCoinOffered);

  }

  function changeRequestCoinAmountOffered(
    uint256 position,
    uint256 coinAmount
  ) external {

    require(creditRequests.length > position, "The position needs to be between bounds");

    require(creditRequests[position].requestStatus == 2, "The request needs to be CREATED");

    require(creditRequests[position].borrower == msg.sender,
        "The borrower needs to be the caller");

    creditRequests[position].coinAmountOffered = coinAmount;

    emit ChangedRequestCoinAmountOffered(position, coinAmount);

  }

  function payBackDebt(
    uint256 position,
    uint256 _coinAmount
  ) external {

    require(creditRequests.length > position, "The position needs to be between bounds");

    require(creditRequests[position].requestStatus == 0, "The request needs to be STARTED");

    require(creditRequests[position].borrower == msg.sender, "The caller is not the borrower");

    require(creditRequests[position].paidBack.add(_coinAmount) <=
      creditRequests[position].coinAmountOffered, "You cannot pay more than already agreed");

    creditRequests[position].paidBack =
      creditRequests[position].paidBack.add(_coinAmount);

    if (creditRequests[position].paidBack == creditRequests[position].coinAmountOffered) {

      creditRequests[position].requestStatus = 3;

      closeLoan(position);

    }

    ERC20 coinToSend = ERC20(creditRequests[position].coinOffered);

    require(coinToSend.allowance(msg.sender, address(this)) >= _coinAmount,
      "The sender did not approve enough coins to pay back their debt");

    require(coinToSend.transferFrom
        (msg.sender, creditRequests[position].lender, _coinAmount));

    emit PaidBack(msg.sender, position, _coinAmount, creditRequests[position].paidBack);

  }

  function borrowerGetBackCollateral(
    uint256 position
  ) external {

    emit GotBackCollateral(msg.sender, position);

  }

  function punishBorrowerNonPayment(
    uint256 position
  ) external {

    emit PunishedBorrower(msg.sender, position);

  }

  //PRIVATE

  function closeLoan(uint256 position) private {

    address borrower = creditRequests[position].borrower;
    address lender = creditRequests[position].lender;

    uint256 points = creditRequests[position].borrowedPoints;

    users[borrower].currentlyBorrowedPoints =
      users[borrower].currentlyBorrowedPoints.sub(points);

    users[lender].currentlyLentPoints =
      users[lender].currentlyLentPoints.sub(points);

    users[lender].personalScore =
      users[lender].personalScore + int256(points);

  }

  //GETTERS

  function getScoreFromCard(string memory category, uint256 level) public view returns (int256) {

    return scorecard[category][level];

  }

  function isCoinWhitelisted(address coin) public view returns (bool) {

    return whitelistedCoins[coin];

  }

  function doesUserExist(address user) public view returns (bool) {

    return userExists[user];

  }

  function getPersonalScore(address user) public view returns (int256) {

    return users[user].personalScore;

  }

  function getCurrentlyBorrowed(address user) public view returns (uint256) {

    return users[user].currentlyBorrowedPoints;

  }

  function getAllTimeLent(address user) public view returns (uint256) {

    return users[user].allTimeLentPoints;

  }

  function getAllTimeBorrowed(address user) public view returns (uint256) {

    return users[user].allTimeBorrowedPoints;

  }

  function getCurrentlyLent(address user) public view returns (uint256) {

    return users[user].currentlyLentPoints;

  }

  function getRequestStatus(uint256 position) public view returns (uint8) {

    return creditRequests[position].requestStatus;

  }

  function getRequestCreation(uint256 position) public view returns (uint256) {

    return creditRequests[position].creationTime;

  }

  function getRequestLendingDuration(uint256 position) public view returns (uint256) {

    return creditRequests[position].lendingDuration;

  }

  function getRequestParties(uint256 position) public view returns (address, address) {

    return (creditRequests[position].borrower,
            creditRequests[position].lender);

  }

  function getRequestPaidBack(uint256 position) public view returns (uint256) {

    return creditRequests[position].paidBack;

  }

  function getRequestBorrowedPoints(uint256 position) public view returns (uint256) {

    return creditRequests[position].borrowedPoints;

  }

  function getRequestCoinOffered(uint256 position) public view returns (address) {

    return creditRequests[position].coinOffered;

  }

  function getRequestCoinAmountOffered(uint256 position) public view returns (uint256) {

    return creditRequests[position].coinAmountOffered;

  }

}
