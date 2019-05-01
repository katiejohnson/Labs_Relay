const ESTATE_NAME = 'Estate';
const ESTATE_SYMBOL = 'EST';

// const LAND_NAME = 'Decentraland LAND';
// const LAND_SYMBOL = 'LAND';
const defaultMANAAmount = '10000000000000000000';

const MANAToken = artifacts.require('MANAToken');
const LANDRegistry = artifacts.require('LANDRegistry');
const EstateRegistry = artifacts.require('EstateRegistry');
const LANDProxy = artifacts.require('LANDProxy');
const Marketplace = artifacts.require('Marketplace');

module.exports = async function (deployer, network, accounts) {

  if(network === 'development'){

    // MANA token

    await deployer.deploy(MANAToken, { from: accounts[0] });

    const mana = await MANAToken.deployed();

    //Give MANA to each address

    for(let i = 0; i < accounts.length; i++){

      await mana.mint(accounts[i], defaultMANAAmount, { from: accounts[0] });

    }

    // Land registry with proxy
    await deployer.deploy(LANDProxy, { from: accounts[0] });
    await deployer.deploy(LANDRegistry, { from: accounts[0] });

    const landProxy = await LANDProxy.deployed();
    const landRegistry = await LANDRegistry.deployed();

    await landProxy.upgrade(landRegistry.address, accounts[0], { from: accounts[0] });

    await deployer.deploy(EstateRegistry, ESTATE_NAME, ESTATE_SYMBOL, landProxy.address, { from: accounts[0] });

    const estate = await EstateRegistry.deployed();

    const land = await LANDRegistry.at(landProxy.address);
    await land.initialize(accounts[0], { from: accounts[0] });
    await land.setEstateRegistry(estate.address);

    await land.authorizeDeploy(accounts[0], { from: accounts[0] });

    for(let i = 0; i < 15; i++){

      await land.assignNewParcel(0, i, accounts[1], { from: accounts[0] });
      await land.assignNewParcel(1, i, accounts[2], { from: accounts[0] });
      await land.assignNewParcel(2, i, accounts[3], { from: accounts[0] });

    }

    await land.ping({ from: accounts[1] });
    await land.ping({ from: accounts[2] });
    await land.ping({ from: accounts[3] });

    // Marketplace

    await deployer.deploy(Marketplace, { from: accounts[0] });
    const marketplace = await Marketplace.deployed();

    const params = [
      MANAToken.address,
      LANDProxy.address,
      accounts[0]
    ];

    await marketplace.initialize(...params);

  } else if (network === "ropsten") {}

  console.log(`
    MANAToken: ${MANAToken.address}
    LANDProxy: ${LANDProxy.address}
    LANDRegistry: ${LANDRegistry.address}
    Marketplace: ${Marketplace.address}
  `);

};
