const VotingCredit = artifacts.require('VotingCredit');

var increaseTime = require('./helpers/increaseTime')

contract('VotingCredit', function (accounts) {

  const proposalDuration = 60 * 60 * 24 * 60; //60 days

  var voting;

  beforeEach('Setting up', async () => {

    voting = await VotingCredit.new(proposalDuration, {from: accounts[0]});

  })

  it("should successfuly propose a param vote", async () => {

    await voting.proposeParamVote(
      0,
      "Bank Spam",
      0,
      -40,
      "some_ipfs_details",
      {from: accounts[1]}
    );

    var proposalStage = await voting.getProposalStage(0);
    var proposalType = await voting.getProposalType(0);
    var proposalParamName = await voting.getProposalParamName(0);
    var proposalLevel = await voting.getProposalParamLevel(0);
    var proposalPoints = await voting.getProposalParamPoints(0);
    var proposalIPFS = await voting.getProposalIPFSDetails(0);
    var proposalCreator = await voting.getProposalCreator(0);
    var proposalResult = await voting.getProposalResult(0);

    assert(proposalStage.toString() == "0", "The stage is not zero")
    assert(proposalType.toString() == "0", "The type is not zero")
    assert(proposalParamName.toString() == "Bank Spam", "The param name is not Bank Spam")
    assert(proposalLevel.toString() == "0", "The level is not zero")
    assert(proposalPoints.toString() == "-40", "The points are not -40")
    assert(proposalIPFS.toString() == "some_ipfs_details", "The IPFS link is not some_ipfs_details")
    assert(proposalCreator.toString() == accounts[1].toString(), "The creator is not accounts[1]")
    assert(proposalResult.toString() == "false", "The result is not false")

  })

  it("should successfuly propose a new formula", async () => {

    await voting.proposeNewFormula(
      "ipfs_to_new_formula",
      {from: accounts[2]}
    );

    var proposalStage = await voting.getProposalStage(0);
    var proposalType = await voting.getProposalType(0);
    var proposalParamName = await voting.getProposalParamName(0);
    var proposalLevel = await voting.getProposalParamLevel(0);
    var proposalPoints = await voting.getProposalParamPoints(0);
    var proposalIPFS = await voting.getProposalIPFSDetails(0);
    var proposalCreator = await voting.getProposalCreator(0);
    var proposalResult = await voting.getProposalResult(0);

    assert(proposalStage.toString() == "0", "The stage is not zero")
    assert(proposalType.toString() == "0", "The type is not zero")
    assert(proposalParamName.toString() == "", "The param name is not ''")
    assert(proposalLevel.toString() == "0", "The level is not zero")
    assert(proposalPoints.toString() == "0", "The points are not 0")
    assert(proposalIPFS.toString() == "ipfs_to_new_formula", "The IPFS link is not ipfs_to_new_formula")
    assert(proposalCreator.toString() == accounts[2].toString(), "The creator is not accounts[1]")
    assert(proposalResult.toString() == "false", "The result is not false")

  })

  it("should successfuly cancel a proposal", async () => {

    await voting.proposeParamVote(
      0,
      "Bank Spam",
      0,
      -40,
      "some_ipfs_details",
      {from: accounts[1]}
    );

    await voting.cancelProposal(
      0,
      {from: accounts[1]}
    );

    var proposalStage = await voting.getProposalStage(0);

    assert(proposalStage.toString() == "1", "The stage is not one")

  })

  it("should successfuly vote on a proposal", async () => {

    await voting.proposeParamVote(
      0,
      "Bank Spam",
      0,
      -40,
      "some_ipfs_details",
      {from: accounts[1]}
    );

    await voting.vote(
      0,
      true,
      {from: accounts[2]}
    );

    var alreadyVoted = await voting.addressAlreadyVoted(0, accounts[2]);
    var proposalVotes = await voting.currentVotesOnProposal(0);

    assert(alreadyVoted.toString() == "true", "The address did not already vote")
    assert(proposalVotes[0].toString() == "1", "The proposal does not have 1 yes vote")
    assert(proposalVotes[1].toString() == "0", "The proposal does not have 0 no votes")

  })

  //Web3js problem with sendAsync, will solve later, need to move fast now

/*  it("should successfuly count the votes and register the result", async () => {

    await voting.proposeParamVote(
      0,
      "Bank Spam",
      0,
      -40,
      "some_ipfs_details",
      {from: accounts[1]}
    );

    await voting.vote(
      0,
      true,
      {from: accounts[2]}
    );

    await increaseTime.increaseTimeTo(web3.eth.getBlock(web3.eth.blockNumber).timestamp + increaseTime.duration.days(64));

    await voting.countVotes(0, {from: accounts[3]})

  })*/

})
