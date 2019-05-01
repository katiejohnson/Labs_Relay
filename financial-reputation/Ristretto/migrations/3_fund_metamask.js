/* global web3 */
// put your metamask address here, so it will always have some ether on local network...
let myMetamaskAddr = "0x930A7CD60A633128B7c5181307781e6d033BA51a";

module.exports = async function(deployer, network) {
  let accounts = await web3.eth.getAccounts();
  if (network === "development") {
    web3.eth.sendTransaction(
      { from: accounts[0], to: myMetamaskAddr, value: 2e18 },
      (e, r) => {
        if (e) {
          console.log("Failed to fund metamask", e);
        } else {
          console.log("Funded metamask @", myMetamaskAddr);
        }
      }
    );
  }
};
