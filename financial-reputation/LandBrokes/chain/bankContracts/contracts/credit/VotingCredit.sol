pragma solidity 0.5.7;

import "./.././interfaces/IVoteCredit.sol";
import "../../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract VotingCredit is IVoteCredit {

  using SafeMath for uint256;

  constructor(uint256 proposalDuration) public {

    require(proposalDuration > 0, "The proposals need to last more than zero seconds");

    DEFAULT_PROPOSAL_DURATION = proposalDuration;

  }

  function proposeParamVote(
    uint8 _type,
    string calldata paramName,
    uint256 lvl,
    int256 points,
    string calldata ipfsDetails
  ) external {

    require(_type < 3, "The type needs to be between bounds");

    proposalNonce = proposalNonce.add(1);

    Proposal memory newProposal =
      Proposal(now, 0, _type, paramName, lvl, points, ipfsDetails, msg.sender, false);

    proposals[proposalNonce - 1] = newProposal;

    Ballot memory newBallot = Ballot(0, 0);

    votes[proposalNonce - 1] = newBallot;

    emit Proposed(_type, paramName, lvl, points, ipfsDetails, msg.sender);

  }

  function proposeNewFormula(
    string calldata formulaOnIpfs
  ) external {

    proposalNonce = proposalNonce.add(1);

    Proposal memory newProposal =
      Proposal(now, 0, 0, "", 0, 0, formulaOnIpfs, msg.sender, false);

    proposals[proposalNonce - 1] = newProposal;

    emit Proposed(0, "", 0, 0, formulaOnIpfs, msg.sender);

  }

  function cancelProposal(
    uint256 nonce
  ) external {

    require(proposals[nonce].stage == 0, "The proposal must be ongoing");
    require(proposals[nonce].creator == msg.sender, "The sender is not the creator of the proposal");
    require(proposals[nonce].creationTime + DEFAULT_PROPOSAL_DURATION * 1 seconds > now,
      "The proposal already expired");

    proposals[nonce].stage = 1;

    emit Cancelled(nonce);

  }

  function vote(
    uint256 nonce,
    bool castedVote
  ) external {

    require(proposals[nonce].stage == 0, "The proposal cannot be voted on");
    require(alreadyVoted[msg.sender][nonce] == false, "This address already voted on the proposal");
    require(proposals[nonce].creationTime + DEFAULT_PROPOSAL_DURATION * 1 seconds > now,
      "The proposal already expired");

    alreadyVoted[msg.sender][nonce] = true;

    if (castedVote) {

      votes[proposalNonce - 1].yes = votes[proposalNonce - 1].yes.add(1);

    } else {

      votes[proposalNonce - 1].no = votes[proposalNonce - 1].no.add(1);

    }

    emit Voted(
      nonce,
      castedVote
    );

  }

  function countVotes(uint256 nonce) external {

    require(proposals[nonce].creationTime + DEFAULT_PROPOSAL_DURATION * 1 seconds < now,
      "The proposal is still ongoing");

    require(proposals[nonce].stage == 0, "The proposal must not be cancelled or already finished");

    proposals[nonce].stage = 2;

    if (votes[nonce].yes > votes[nonce].no)
      proposals[nonce].endResult = true;

    else
      proposals[nonce].endResult = false;

    emit CountedVotes(
      nonce,
      proposals[nonce].endResult
    );

  }

  function getProposalCreationTime(uint256 position) public view returns (uint256) {

    return proposals[position].creationTime;

  }

  function getProposalStage(uint256 position) public view returns (uint8) {

    return proposals[position].stage;

  }

  function getProposalType(uint256 position) public view returns (uint8) {

    return proposals[position].proposalType;

  }

  function getProposalParamName(uint256 position) public view returns (string memory) {

    return proposals[position].paramName;

  }

  function getProposalParamLevel(uint256 position) public view returns (uint256) {

    return proposals[position].paramLevel;

  }

  function getProposalParamPoints(uint256 position) public view returns (int256) {

    return proposals[position].paramPoints;

  }

  function getProposalIPFSDetails(uint256 position) public view returns (string memory) {

    return proposals[position].ipfsDetails;

  }

  function getProposalCreator(uint256 position) public view returns (address) {

    return proposals[position].creator;

  }

  function getProposalResult(uint256 position) public view returns (bool) {

    return proposals[position].endResult;

  }

  function addressAlreadyVoted(uint256 position, address who) public view returns (bool) {

    return alreadyVoted[who][position];

  }

  function currentVotesOnProposal(uint256 position) public view returns (uint256, uint256) {

    return (votes[position].yes, votes[position].no);

  }

}
