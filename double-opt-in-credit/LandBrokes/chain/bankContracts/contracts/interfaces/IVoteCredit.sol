pragma solidity 0.5.7;

contract IVoteCredit {

  event Proposed(uint8 _type,
  string paramName,
  uint256 lvl,
  int256 points,
  string ipfsDetails,
  address creator);

  event Voted(
    uint256 nonce,
    bool castedVote
  );

  event CountedVotes(
    uint256 nonce,
    bool result
  );

  event Cancelled(uint256 nonce);

  uint256 proposalNonce;

  uint256 DEFAULT_PROPOSAL_DURATION;

  mapping(uint256 => Proposal) proposals;

  mapping(uint256 => Ballot) votes;

  mapping(address => mapping(uint256 => bool)) alreadyVoted;

  enum PROPOSAL_TYPES {MODIFY, CREATE, REMOVE}

  enum PROPOSAL_STAGE {ONGOING, CANCELLED, FINISHED}

  struct Ballot {

    uint256 yes;
    uint256 no;

  }

  struct Proposal {

    uint256 creationTime;

    uint8 stage;

    uint8 proposalType;

    string paramName;

    uint256 paramLevel;

    int256 paramPoints;

    string ipfsDetails;

    address creator;

    bool endResult;

  }

  function proposeParamVote(
    uint8 _type,
    string calldata paramName,
    uint256 lvl,
    int256 points,
    string calldata ipfsDetails
  ) external;

  function proposeNewFormula(
    string calldata formulaOnIpfs
  ) external;

  function cancelProposal(
    uint256 nonce
  ) external;

  function vote(
    uint256 nonce,
    bool castedVote
  ) external;

  function countVotes(uint256 nonce) external;

}
