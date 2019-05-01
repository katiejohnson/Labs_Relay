const path = require('path');
const Ethers = require('ethers');

const Config = require(path.join(srcDir, '../config') );

const MANATokenABI = require(path.join(srcDir, '../../chain/landSC/build/contracts/MANAToken') ).abi; // eslint-disable-line node/no-unpublished-require
const LANDRegistryABI = require(path.join(srcDir, '../../chain/landSC/build/contracts/LANDRegistry') ).abi; // eslint-disable-line node/no-unpublished-require
const MarketplaceABI = require(path.join(srcDir, '../../chain/landSC/build/contracts/Marketplace') ).abi; // eslint-disable-line node/no-unpublished-require

const BankABI = require(path.join(srcDir, '../../chain/bankContracts/build/contracts/Bank') ).abi; // eslint-disable-line node/no-unpublished-require
const SplitLandABI = require(path.join(srcDir, '../../chain/bankContracts/build/contracts/SplitLand') ).abi; // eslint-disable-line node/no-unpublished-require

const Bank = require(path.join(srcDir, '/modules/bank') );

describe('Bank', () => {

  before( () => {

    this.provider = new Ethers.providers.JsonRpcProvider('http://localhost:8545');
    this.walletCreator = new Ethers.Wallet(Config.privateKey, this.provider);
    this.wallet1 = new Ethers.Wallet('0x6cbed15c793ce57650b9877cf6fa156fbef513c4e6134f022a85b1ffdd59b2a1', this.provider);
    this.wallet2 = new Ethers.Wallet('0x6370fd033278c143179d81c5526140625662b8daa446c22ee2d73db3707e620c', this.provider);

  });

  beforeEach( () => {

    this.sandbox = createSandbox();

  });

  afterEach( () => {

    this.sandbox && this.sandbox.restore();

  });

  describe('Check state', () => {

    describe('Decentraland', () => {

      it('Should have mana token', async () => {

        const manaContract = new Ethers.Contract(Config.contractsAddress.development.addressManaToken, MANATokenABI, this.wallet1);
        const manaBalance = await manaContract.balanceOf(this.wallet1.address);
        expect(Ethers.utils.formatEther(manaBalance).toString() ).to.be.eq('10.0');

      });

      it('Should have land', async () => {

        const landProxyContract = new Ethers.Contract(Config.contractsAddress.development.decentralandLandProxy, LANDRegistryABI, this.wallet1);
        const landsCoords = await landProxyContract.landOf(this.wallet1.address);
        expect(landsCoords.length).to.be.gt(0);
        const owner = await landProxyContract.ownerOfLand(landsCoords[0][5].toNumber(), landsCoords[1][5].toNumber());
        expect(owner).to.be.eq(this.wallet1.address);
        // const landData = await landProxyContract.landData(landsCoords[0][5].toNumber(), landsCoords[1][5].toNumber() );

      });

      it('Should sell and buy land on marketplace', async () => {

        const landCoords = [0, 5];
        const landProxyContract = new Ethers.Contract(Config.contractsAddress.development.decentralandLandProxy, LANDRegistryABI, this.wallet1);
        const marketplaceContract = new Ethers.Contract(Config.contractsAddress.development.addressDecentralandMarketplace, MarketplaceABI, this.wallet1);
        const assetId = await landProxyContract.encodeTokenId(...landCoords);
        const price = 12345;

        await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, true, {
          gasLimit: 1000000, // wrong estimation
        });

        const paramsCreateOrder = [
          Config.contractsAddress.development.decentralandLandProxy,
          assetId,
          price,
          parseInt(Date.now() / 1000, 10) + 60 * 30
        ];
        await marketplaceContract['createOrder(address,uint256,uint256,uint256)'](...paramsCreateOrder);

        const owner = await landProxyContract.ownerOfLand(...landCoords);
        expect(owner).to.be.eq(this.wallet1.address);

        const manaContract = new Ethers.Contract(Config.contractsAddress.development.addressManaToken, MANATokenABI, this.wallet2);
        await manaContract.approve(Config.contractsAddress.development.addressDecentralandMarketplace, price);

        const paramsExecuteOrder = [
          Config.contractsAddress.development.decentralandLandProxy,
          assetId,
          price
        ];
        await marketplaceContract.connect(this.wallet2)['executeOrder(address,uint256,uint256)'](...paramsExecuteOrder);

        const newOwner = await landProxyContract.ownerOfLand(...landCoords);
        expect(newOwner).to.be.eq(this.wallet2.address);

        await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, false, {
          gasLimit: 1000000, // wrong estimation
        });

      });

    });

    describe('Bank', () => {

      it('Should deposit and withdraw fund and get investors data', async () => {

        const amount = '12345';

        const manaContract = new Ethers.Contract(Config.contractsAddress.development.addressManaToken, MANATokenABI, this.wallet1);
        await manaContract.approve(Config.contractsAddress.development.addressBank, amount);

        const bankContract = new Ethers.Contract(Config.contractsAddress.development.addressBank, BankABI, this.wallet1);
        const balanceBank = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceBank.toString() ).to.be.eq('0');

        await bankContract.depositMANA(1, this.wallet1.address, amount);
        const balanceBankFunded = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceBankFunded.toString() ).to.be.eq(amount);

        const splitInvestorsData = await bankContract.getSplitInvestorsData();
        expect(splitInvestorsData.length).to.be.eq(2);
        expect(splitInvestorsData[0].length).to.be.eq(1);
        expect(splitInvestorsData[0][0]).to.be.eq(this.wallet1.address);
        expect(splitInvestorsData[1][0].toString() ).to.be.eq(amount);

        await bankContract.withdrawMANA(1, '12340');
        const balanceUpdated = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceUpdated.toString() ).to.be.eq('5');

        const investorsData = await bankContract.getSplitInvestorsData();
        expect(investorsData[0].length).to.be.eq(1);
        expect(investorsData[1][0].toString() ).to.be.eq('5');
        expect(investorsData[0][0].toString() ).to.be.eq(this.wallet1.address);

        await bankContract.withdrawMANA(1, '5');
        const balanceUpdated1 = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceUpdated1.toString() ).to.be.eq('0');

        const investorsData1 = await bankContract.getSplitInvestorsData();
        expect(investorsData1[0].length).to.be.eq(0);

      });

      it('Should buy land and receive token part', async () => {

        const landCoords = [0, 3];
        const price = '30';
        const amount1 = '10';
        const amount2 = '20';

        const landProxyContract = new Ethers.Contract(Config.contractsAddress.development.decentralandLandProxy, LANDRegistryABI, this.wallet1);
        const assetId = await landProxyContract.encodeTokenId(...landCoords);
        const marketplaceContract = new Ethers.Contract(Config.contractsAddress.development.addressDecentralandMarketplace, MarketplaceABI, this.wallet1);
        await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, true, {
          gasLimit: 1000000, // wrong estimation
        });
        const paramsCreateOrder = [
          Config.contractsAddress.development.decentralandLandProxy,
          assetId,
          price,
          parseInt(Date.now() / 1000, 10) + 60 * 30
        ];
        await marketplaceContract['createOrder(address,uint256,uint256,uint256)'](...paramsCreateOrder);

        const manaContract = new Ethers.Contract(Config.contractsAddress.development.addressManaToken, MANATokenABI, this.wallet1);
        await manaContract.approve(Config.contractsAddress.development.addressBank, amount1);
        await manaContract.connect(this.wallet2).approve(Config.contractsAddress.development.addressBank, amount2);

        const bankContract = new Ethers.Contract(Config.contractsAddress.development.addressBank, BankABI, this.wallet1);
        await bankContract.depositMANA(1, this.wallet1.address, amount1);
        await bankContract.connect(this.wallet2).depositMANA(1, this.wallet2.address, amount2);

        const balanceBank = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceBank.toString() ).to.be.eq('30');
        const paramsDirectBuyLand = [
          1,
          assetId,
          [this.wallet1.address, this.wallet2.address],
          [amount1, amount2]
        ];
        await bankContract.connect(this.walletCreator).directBuyLand(...paramsDirectBuyLand);

        const balanceBankUpdated = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
        expect(balanceBankUpdated.toString() ).to.be.eq('0');
        const newOwner = await landProxyContract.ownerOfLand(...landCoords);
        expect(newOwner).to.be.eq(Config.contractsAddress.development.addressBank);

        const landTokenSplitAddress = await bankContract.getLandTokenSplitAddress(assetId);
        expect(landTokenSplitAddress).to.be.eq('0x759D219b88a5124Ff483BB881C69366BE659e397');
        const landTokenSplitContract = new Ethers.Contract(landTokenSplitAddress, SplitLandABI, this.wallet1);
        const balance1 = await landTokenSplitContract.balanceOf(this.wallet1.address);
        expect(balance1.toString() ).to.be.eq('3300');
        const balance2 = await landTokenSplitContract.balanceOf(this.wallet2.address);
        expect(balance2.toString() ).to.be.eq('6700');

        await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, false, {
          gasLimit: 1000000, // wrong estimation
        });

      });

    });

  });

  describe('Check bid for land', () => {

    beforeEach( async () => {

      this.bank = new Bank();
      await this.bank.init();

    });

    it('Should check bid and buy land', async () => {

      const landCoords = [0, 4];
      const price = '30';
      const amount1 = '10';
      const amount2 = '20';

      const landProxyContract = new Ethers.Contract(Config.contractsAddress.development.decentralandLandProxy, LANDRegistryABI, this.wallet1);
      const assetId = await landProxyContract.encodeTokenId(...landCoords);
      const marketplaceContract = new Ethers.Contract(Config.contractsAddress.development.addressDecentralandMarketplace, MarketplaceABI, this.wallet1);
      await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, true, {
        gasLimit: 1000000, // wrong estimation
      });
      const paramsCreateOrder = [
        Config.contractsAddress.development.decentralandLandProxy,
        assetId,
        price,
        parseInt(Date.now() / 1000, 10) + 60 * 30
      ];
      await marketplaceContract['createOrder(address,uint256,uint256,uint256)'](...paramsCreateOrder);

      const manaContract = new Ethers.Contract(Config.contractsAddress.development.addressManaToken, MANATokenABI, this.wallet1);
      await manaContract.approve(Config.contractsAddress.development.addressBank, amount1);
      await manaContract.connect(this.wallet2).approve(Config.contractsAddress.development.addressBank, amount2);

      const bankContract = new Ethers.Contract(Config.contractsAddress.development.addressBank, BankABI, this.wallet1);
      await bankContract.depositMANA(1, this.wallet1.address, amount1);
      await bankContract.connect(this.wallet2).depositMANA(1, this.wallet2.address, amount2);
      const stubBestLands = [ { id: assetId, price } ];

      this.sandbox.stub(Bank , '_findBestBidForLands').resolves(stubBestLands);

      await this.bank.checkBidForLands();

      const balanceBankUpdated = await manaContract.balanceOf(Config.contractsAddress.development.addressBank);
      expect(balanceBankUpdated.toString() ).to.be.eq('0');
      const newOwner = await landProxyContract.ownerOfLand(...landCoords);
      expect(newOwner).to.be.eq(Config.contractsAddress.development.addressBank);

      await landProxyContract.setApprovalForAll(Config.contractsAddress.development.addressDecentralandMarketplace, false, {
        gasLimit: 1000000, // wrong estimation
      });

    });

  });

});
