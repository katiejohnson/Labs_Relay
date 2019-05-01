const CreditScoring = artifacts.require('CreditScoring');
const MANAToken = artifacts.require('MANAToken');

var increaseTime = require('./helpers/increaseTime')

contract('CreditScoring', function (accounts) {

  const _maxRequestAvailability = 60 * 60 * 24 * 30;
  const _minCancelRequestDelay = 60 * 60 * 24 * 7;
  const _MAX_BORROWED_CREDIT_POINTS = 50;
  const _MAX_LENT_CREDIT_POINTS = 50;
  const _WAIT_FOR_COLLATERAL_RETREIVAL = 60 * 60 * 24 * 7;
  const _BORROWED_KEEPING_TIME_LIMIT = 60 * 60 * 24 * 90;

  const creditScoringParams = [
    _maxRequestAvailability,
    _minCancelRequestDelay,
    _MAX_BORROWED_CREDIT_POINTS,
    _MAX_LENT_CREDIT_POINTS,
    _WAIT_FOR_COLLATERAL_RETREIVAL,
    _BORROWED_KEEPING_TIME_LIMIT
  ];

  var credit, mana;

  beforeEach('Setting up', async () => {

    credit = await CreditScoring.new(...creditScoringParams, {from: accounts[0]});

    mana = await MANAToken.new({from: accounts[0]});

    await credit.toggleWhitelistedCoin(
      mana.address,
      {from: accounts[0]}
    );

    await mintCoins();

    await setupScorecard();

  })

  it("should correctly compute credit scores without updating the user data", async () => {

    await credit.registerUser(
      accounts[3],
      {from: accounts[0]}
    );

    var userExistence = await credit.doesUserExist(accounts[3])

    assert(userExistence.toString() == "true", "The user was not registered");

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    var secondComputationCategories = [
      "DEPOSIT HISTORY",
      "INVESTING HISTORY",
      "BANK SPAM",
      "MORTGAGE SEEKED",
      "OUTSTANDING DEBT",
      "TIMES DEFAULTED"
    ];

    var secondComputationLevels = [2, 1, 1, 1, 2, 0];

    var firstComputationResult = await credit.computeCreditScore(
      accounts[3],
      firstComputationCategories,
      firstComputationLevels
    );

    var secondComputationResult = await credit.computeCreditScore(
      accounts[3],
      secondComputationCategories,
      secondComputationLevels
    );

    var thirdComputationResult = await credit.computeCreditScore(
      accounts[5],
      secondComputationCategories,
      secondComputationLevels
    );

    assert(firstComputationResult.toString() == "62", "The first computation does not give 62 points")

    assert(secondComputationResult.toString() == "155", "The second computation does not give 155 points")

    assert(thirdComputationResult.toString() == "0", "The third computation does not give 0 points")

  })

  it("should correctly compute and update the score of a user", async () => {

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    await credit.computeAndUpdateScore(
      accounts[4],
      firstComputationCategories,
      firstComputationLevels,
      "SOME_IPFS_PROOF"
    );

    var userExistence = await credit.doesUserExist(accounts[4])

    assert(userExistence.toString() == "true", "accounts[4] was not registered after updating their score data");

    var userScore = await credit.getPersonalScore(accounts[4])

    assert(userScore.toString() == "62", "The user's score is not 62")

  })

  it("should let users register themselves", async () => {

    await credit.registerUser(
      accounts[5],
      {from: accounts[5]}
    );

    var userExistence = await credit.doesUserExist(accounts[5])

    assert(userExistence.toString() == "true", "The user was not registered");

  })

  it("should let users request credit points", async () => {

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    await credit.computeAndUpdateScore(
      accounts[4],
      firstComputationCategories,
      firstComputationLevels,
      "SOME_IPFS_PROOF"
    );

    var manaToOffer = 10 ** 10

    await mana.approve(credit.address, manaToOffer, {from: accounts[4]});

    await credit.requestCreditPoints(
      accounts[4],
      60 * 60 * 24 * 9, //9 days
      30,
      mana.address,
      manaToOffer,
      {from: accounts[4]}
    );

    var userCurrentlyBorrowed = await credit.getCurrentlyBorrowed(accounts[4]);
    var userAllTimeBorrowed = await credit.getAllTimeBorrowed(accounts[4]);
    var requestStatus = await credit.getRequestStatus(0);
    var requestDuration = await credit.getRequestLendingDuration(0);
    var requestParties = await credit.getRequestParties(0);
    var requestPaidBack = await credit.getRequestPaidBack(0);
    var requestBorrowedPoints = await credit.getRequestBorrowedPoints(0);
    var requestCoinOffered = await credit.getRequestCoinOffered(0);
    var requestCoinAmount = await credit.getRequestCoinAmountOffered(0);

    assert(userCurrentlyBorrowed.toString() == "0", "The user currently has borrowed points");
    assert(userAllTimeBorrowed.toString() == "0", "The user borrowed points in the past");
    assert(requestStatus.toString() == "2", "The request status is not 2");
    assert(requestDuration.toString() == "777600", "The request lending duration is not 777600");
    assert(requestParties[0].toString() == accounts[4], "The borrower is not accounts[4]")

    assert("0x0000000000000000000000000000000000000000" == requestParties[1].toString(),
      "The lender is actually specified")

    assert(requestPaidBack.toString() == 0, "The borrower started to pay back");
    assert(requestBorrowedPoints.toString() == 30, "The borrower did not request 30 points");
    assert(requestCoinOffered.toString() == mana.address, "The coin offered is not MANA");
    assert(requestCoinAmount.toString() == manaToOffer.toString(), "The borrower did not offer to pay 10 ** 10 coins");

  })

  it("should let the owner fill requests", async () => {

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    await credit.computeAndUpdateScore(
      accounts[4],
      firstComputationCategories,
      firstComputationLevels,
      "SOME_IPFS_PROOF"
    );

    var manaToOffer = 10 ** 10

    await mana.approve(credit.address, manaToOffer, {from: accounts[4]});

    await credit.requestCreditPoints(
      accounts[4],
      60 * 60 * 24 * 9, //9 days
      30,
      mana.address,
      manaToOffer,
      {from: accounts[4]}
    );

    await credit.fillRequest(
      0,
      {from: accounts[0]}
    );

    var userCurrentlyBorrowed = await credit.getCurrentlyBorrowed(accounts[4]);
    var userAllTimeBorrowed = await credit.getAllTimeBorrowed(accounts[4]);

    var requestStatus = await credit.getRequestStatus(0);
    var requestParties = await credit.getRequestParties(0);

    assert(requestParties[1].toString() == accounts[0], "The owner is not the filler")
    assert(userCurrentlyBorrowed.toString() == "30", "The user currently has no borrowed points");
    assert(userAllTimeBorrowed.toString() == "30", "The user never borrowed points");
    assert(requestStatus.toString() == "0", "The request status is not 0");

  })

  it("should let other addresses apart from the owner to fill requests", async () => {

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    var secondComputationCategories = [
      "DEPOSIT HISTORY",
      "INVESTING HISTORY",
      "BANK SPAM",
      "MORTGAGE SEEKED",
      "OUTSTANDING DEBT",
      "TIMES DEFAULTED"
    ];

    var secondComputationLevels = [2, 1, 1, 1, 2, 0];

    await credit.computeAndUpdateScore(
      accounts[4],
      firstComputationCategories,
      firstComputationLevels,
      "SOME_IPFS_PROOF"
    );

    await credit.computeAndUpdateScore(
      accounts[5],
      secondComputationCategories,
      secondComputationLevels,
      "SOME_IPFS_PROOF"
    );

    var manaToOffer = 10 ** 10

    await mana.approve(credit.address, manaToOffer, {from: accounts[4]});

    await credit.requestCreditPoints(
      accounts[4],
      60 * 60 * 24 * 9, //9 days
      30,
      mana.address,
      manaToOffer,
      {from: accounts[4]}
    );

    await credit.fillRequest(
      0,
      {from: accounts[5]}
    );

    var userCurrentlyBorrowed = await credit.getCurrentlyBorrowed(accounts[4]);
    var userAllTimeBorrowed = await credit.getAllTimeBorrowed(accounts[4]);

    var requestStatus = await credit.getRequestStatus(0);
    var requestParties = await credit.getRequestParties(0);

    var allTimeLentLender = await credit.getAllTimeLent(accounts[5]);
    var currentlyLentLender = await credit.getCurrentlyLent(accounts[5]);
    var lenderScore = await credit.getPersonalScore(accounts[5])

    assert(lenderScore.toString() == "125", "The lender's personal score is not 125")
    assert(allTimeLentLender.toString() == "30", "The lender did not lend 30 points in total")
    assert(currentlyLentLender.toString() == "30", "The lender is not currently lending 30 points")
    assert(requestParties[1].toString() == accounts[5], "accounts[5] is not the filler")
    assert(userCurrentlyBorrowed.toString() == "30", "The user currently has no borrowed points");
    assert(userAllTimeBorrowed.toString() == "30", "The user never borrowed points");
    assert(requestStatus.toString() == "0", "The request status is not 0");

  })

  it("should let the borrower pay back their debt", async () => {

    var firstComputationCategories = ["DEPOSIT HISTORY", "BANK SPAM", "MORTGAGE SEEKED"]
    var firstComputationLevels = [1, 2, 2];

    await credit.computeAndUpdateScore(
      accounts[4],
      firstComputationCategories,
      firstComputationLevels,
      "SOME_IPFS_PROOF"
    );

    var manaToOffer = 10 ** 10

    await mana.approve(credit.address, manaToOffer, {from: accounts[4]});

    await credit.requestCreditPoints(
      accounts[4],
      60 * 60 * 24 * 9, //9 days
      30,
      mana.address,
      manaToOffer,
      {from: accounts[4]}
    );

    await mana.approve(credit.address, manaToOffer, {from: accounts[4]});

    await credit.fillRequest(
      0,
      {from: accounts[0]}
    );

    await credit.payBackDebt(
      0,
      10**8,
      {from: accounts[4]}
    )

    var ownerNewManaAmount = await mana.balanceOf(accounts[0]);

    assert("1000100000000" == ownerNewManaAmount.toString(), "The owner did not get their pay")

  })

  async function mintCoins() {

    var defaultToMint = 10 ** 12;

    for (var i = 0; i < accounts.length; i++) {

      await mana.mint(accounts[i], defaultToMint, {from: accounts[0]})

    }

  }

  async function setupScorecard() {

    var depositHistoryPoints = [0, 55, 30, 15, 5]

    for (var i = 0; i < depositHistoryPoints.length; i++) {

      await credit.setCardOption(
        "DEPOSIT HISTORY",
        i,
        depositHistoryPoints[i],
        {from: accounts[0]}
      )

    }

    var investingHistoryPoints = [0, 10, 30, 55, 65]

    for (i = 0; i < investingHistoryPoints.length; i++) {

      await credit.setCardOption(
        "INVESTING HISTORY",
        i,
        investingHistoryPoints[i],
        {from: accounts[0]}
      )

    }

    var bankSpam = [30, 10, -3]

    for (i = 0; i < bankSpam.length; i++) {

      await credit.setCardOption(
        "BANK SPAM",
        i,
        bankSpam[i],
        {from: accounts[0]}
      )

    }

    var mortgageSeeked = [65, 30, 10, 0]

    for (i = 0; i < mortgageSeeked.length; i++) {

      await credit.setCardOption(
        "MORTGAGE SEEKED",
        i,
        mortgageSeeked[i],
        {from: accounts[0]}
      )

    }

    var outstandingDebt = [65, 30, 10, 0]

    for (i = 0; i < outstandingDebt.length; i++) {

      await credit.setCardOption(
        "OUTSTANDING DEBT",
        i,
        outstandingDebt[i],
        {from: accounts[0]}
      )

    }

    var timesDefaulted = [65, 30, 10, 0]

    for (i = 0; i < timesDefaulted.length; i++) {

      await credit.setCardOption(
        "TIMES DEFAULTED",
        i,
        timesDefaulted[i],
        {from: accounts[0]}
      )

    }

  }

})
