pragma solidity 0.5.7;

interface Marketplace {

  function executeOrder(address nftAddress, uint256 assetId, uint256 price) external;

}
