const path = require('path');
const Ethers = require('ethers');

const Config = require(path.join(srcDir, '../config') );
const Utils = require(path.join(srcDir, '/modules/utils') );
const Bank = require(path.join(srcDir, '/modules/bank') );

describe('Bank', () => {

  beforeEach( () => {

    this.sandbox = createSandbox();

  });

  afterEach( () => {

    this.sandbox && this.sandbox.restore();

  });

  it('Should instantiate', () => {

    const bank = new Bank();

    expect(bank.initilized).to.be.false;

  });

  it('Should init', async () => {

    const bank = new Bank();

    await bank.init();

    expect(bank.initilized).to.be.true;
    expect(bank.provider).to.be.an.instanceOf(Ethers.providers.JsonRpcProvider);
    expect(bank.wallet).to.be.an.instanceOf(Ethers.Wallet);
    expect(bank.bankContract).to.be.an.instanceOf(Ethers.Contract);

    await expect(bank.init() ).to.be.rejectedWith('already_initialized');

  });

  it('Should init production', async () => {

    Config.network = 'homestead';
    const bank = new Bank();

    await bank.init();

    expect(bank.initilized).to.be.true;
    expect(bank.provider).to.be.an.instanceOf(Ethers.providers.InfuraProvider);
    expect(bank.wallet).to.be.an.instanceOf(Ethers.Wallet);
    expect(bank.bankContract).to.be.an.instanceOf(Ethers.Contract);

    await expect(bank.init() ).to.be.rejectedWith('already_initialized');
    Config.network = 'development';

  });

  it('Cannot call methods without initialized', async () => {

    const bank = new Bank();
    const asyncMethods = ['checkBidForLands', 'directBuyLand'];

    await Promise.all(asyncMethods.map(asyncMethod =>
      expect(bank[asyncMethod]() ).to.be.rejectedWith('not_initialized')
    ) );

  });

  it('Should find best Land', async () => {

    const mockLandData = {
      data: {
        assets: [
          {
            id: 'id_land_1',
            publication: {
              price: '123'
            }
          },
          {
            id: 'id_land_2',
            publication: {
              price: '234'
            }
          }
        ]
      }
    };

    const stubFetch = this.sandbox.stub(Utils, 'fetch').resolves({
      json: this.sandbox.stub().resolves(mockLandData)
    });

    const bestLands = await Bank._findBestBidForLands();

    expect(stubFetch.calledOnce).to.be.true;
    expect(stubFetch.calledWith(
      `${Config.contractsAddress[Config.network].decentralandApi}/v1/marketplace?limit=12&offset=0&status=open&asset_type=parcel&sort_by=created_at&sort_order=desc`
    ) ).to.be.true;
    expect(bestLands.length).to.be.eq(2);
    expect(bestLands[0].id).to.be.eq('id_land_1');
    expect(bestLands[1].id).to.be.eq('id_land_2');

  });

  describe('selectInvestors', () => {

    it('Should selectInvestors with enough fund', () => {

      const investorsData = [
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000001',
          balance: '1'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000002',
          balance: '2'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000003',
          balance: '3'
        },
      ];
      const price = '3';
      const { selectedInvestorsData, investorsDataUpdated } = Bank._selectInvestors(investorsData, price);
      expect(selectedInvestorsData.length).to.be.eq(2);
      expect(selectedInvestorsData[0].address).to.be.eq('0x0000000000000000000000000000000000000000000000000000000000000001');
      expect(selectedInvestorsData[0].balance.toString() ).to.be.eq('1');
      expect(selectedInvestorsData[1].address).to.be.eq('0x0000000000000000000000000000000000000000000000000000000000000002');
      expect(selectedInvestorsData[1].balance.toString() ).to.be.eq('2');
      expect(investorsDataUpdated).to.be.deep.eq([ investorsData[2] ]);

    });

    it('Cannot selectInvestors without enough fund', () => {

      const investorsData = [
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000001',
          balance: '1'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000002',
          balance: '2'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000003',
          balance: '3'
        },
      ];
      const price = '7';
      const res = Bank._selectInvestors(investorsData, price);
      expect(res).to.be.false;

    });

    it('Should select investor and split balance', async () => {

      const investorsData = [
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000001',
          balance: '1'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000002',
          balance: '2'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000003',
          balance: '3'
        },
      ];
      const price = '2';
      const { selectedInvestorsData, investorsDataUpdated } = Bank._selectInvestors(investorsData, price);
      expect(selectedInvestorsData.length).to.be.eq(2);
      expect(selectedInvestorsData[0].address.toString() ).to.be.eq('0x0000000000000000000000000000000000000000000000000000000000000001');
      expect(selectedInvestorsData[0].balance.toString() ).to.be.eq('1');
      expect(selectedInvestorsData[1].address.toString() ).to.be.eq('0x0000000000000000000000000000000000000000000000000000000000000002');
      expect(selectedInvestorsData[1].balance.toString() ).to.be.eq('1');
      expect(JSON.stringify(investorsDataUpdated)).to.be.eq(JSON.stringify([
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000002',
          balance: '1'
        },
        {
          address: '0x0000000000000000000000000000000000000000000000000000000000000003',
          balance: '3'
        }
      ]) );


    });

  });

  describe('With initialized Bank', () => {

    beforeEach( async () => {

      this.bank = new Bank();
      this.bank.provider = this.sandbox.stub();
      this.bank.wallet = this.sandbox.stub();
      this.bank.bankContract = {
        directBuyLand: this.sandbox.stub(),
        getSplitInvestorsData: this.sandbox.stub()
      };
      this.bank.initilized = true;

    });

    describe('Direct buy land', async () => {

      it('Should buy direct land', async () => {

        const stubTx = {
          wait: this.sandbox.stub()
        };
        this.bank.bankContract.directBuyLand.resolves(stubTx);
        const investorsData = [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '2'
          }
        ];
        await this.bank.directBuyLand('landId', investorsData);

        expect(this.bank.bankContract.directBuyLand.calledOnce).to.be.true;
        expect(this.bank.bankContract.directBuyLand.calledWith(
          1,
          'landId',
          [investorsData[0].address, investorsData[1].address],
          [investorsData[0].balance, investorsData[1].balance])
        ).to.be.true;
        expect(stubTx.wait.calledOnce).to.be.true;

      });

      it('Should buy direct land whole', async () => {

        const stubTx = {
          wait: this.sandbox.stub()
        };
        this.bank.bankContract.directBuyLand.resolves(stubTx);
        const investorsData = [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
        ];
        await this.bank.directBuyLand('landId', investorsData, 'whole');

        expect(this.bank.bankContract.directBuyLand.calledOnce).to.be.true;
        expect(this.bank.bankContract.directBuyLand.calledWith(
          0,
          'landId',
          [investorsData[0].address],
          [investorsData[0].balance])
        ).to.be.true;
        expect(stubTx.wait.calledOnce).to.be.true;

      });

    });

    describe('Check buy land', () => {

      it('Should check buy land', async () => {

        const spySelectInvestors = this.sandbox.spy(Bank, '_selectInvestors');
        const spyLoggerInfo = this.sandbox.spy(Utils.logger, 'info');
        const investorsData = [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '3'
          },
        ];

        const land = {
          id: 'land_1',
          price: '2'
        };

        const stubBuyLand = this.sandbox.stub(this.bank, 'directBuyLand');
        await this.bank._checkBuyLand(land, investorsData);

        const selectedInvestorsData = [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '1'
          }
        ];

        expect(spySelectInvestors.calledOnce).to.be.true;
        expect(spySelectInvestors.calledWith(investorsData, land.price) ).to.be.true;

        expect(stubBuyLand.calledOnce).to.be.true;
        expect(stubBuyLand.calledWith(land.id, selectedInvestorsData) ).to.be.true;

        expect(spyLoggerInfo.calledOnce).to.be.true;
        expect(spyLoggerInfo.calledWith('Find investors for land', {
          service: 'bank',
          selectedInvestorsData,
          landId: land.id,
          price: land.price
        }) ).to.be.true;

      });

      it('Cannot check buy land if no select investors', async () => {

        const spybLoggerInfo = this.sandbox.spy(Utils.logger, 'error');
        const investorsData = [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '1.5'
          },
        ];

        const land = {
          id: 'land_1',
          price: '15'
        };

        await expect(this.bank._checkBuyLand(land, investorsData) ).to.be.rejectedWith(Error, 'cannot_select_investors');
        expect(spybLoggerInfo.calledOnce).to.be.true;
        expect(spybLoggerInfo.calledWith('cannot_select_investors', {
          investorsData,
          land
        }) );
      });

    });

    describe('Check bid for lands', () => {

      it('Should buy lands', async () => {

        const spyLoggerError = this.sandbox.stub(Utils.logger, 'error');

        const stubBestLands = [
          {
            id: 'land_1',
            price: '2',
          },
          {
            id: 'land_2',
            price: '3',
          },
          {
            id: 'land_3',
            price: '4',
          },
        ];

        const stubFindBestBidForLands = this.sandbox.stub(Bank, '_findBestBidForLands').resolves(stubBestLands);
        this.bank.bankContract.getSplitInvestorsData.resolves([
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000000000000000000000000000000000000000000003',
          ],
          [
            '1',
            '2',
            '3'
          ]
        ]);
        const stubBuyLand = this.sandbox.stub(this.bank, 'directBuyLand');

        await this.bank.checkBidForLands();

        expect(stubFindBestBidForLands.calledOnce).to.be.true;
        expect(spyLoggerError.callCount).to.be.eq(0);
        expect(stubBuyLand.callCount).to.be.eq(2);
        expect(stubBuyLand.args[0]).to.be.deep.eq(['land_1', [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '1'
          }
        ] ]);
        expect(stubBuyLand.args[1]).to.be.deep.eq(['land_2', [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '1'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000003',
            balance: '2'
          }
        ] ]);

      });


      it('Should catch error when buy land', async () => {

        const spyLoggerError = this.sandbox.stub(Utils.logger, 'error');

        const stubBestLands = [
          {
            id: 'land_1',
            price: '15',
          },
          {
            id: 'land_2',
            price: '20',
          },
          {
            id: 'land_3',
            price: '20',
          },
        ];

        const stubFindBestBidForLands = this.sandbox.stub(Bank, '_findBestBidForLands').resolves(stubBestLands);
        this.bank.bankContract.getSplitInvestorsData.resolves([
          [
            '0x0000000000000000000000000000000000000000000000000000000000000001',
            '0x0000000000000000000000000000000000000000000000000000000000000002',
            '0x0000000000000000000000000000000000000000000000000000000000000003',
            '0x0000000000000000000000000000000000000000000000000000000000000004',
          ],
          [
            '10',
            '15',
            '15',
            '5',
          ]
        ]);
        const stubBuyLand = this.sandbox.stub(this.bank, 'directBuyLand');
        stubBuyLand.onSecondCall().rejects('fake-error');

        await this.bank.checkBidForLands();

        expect(stubFindBestBidForLands.calledOnce).to.be.true;

        expect(spyLoggerError.calledOnce).to.be.true;
        expect(spyLoggerError.args[0][0]).to.be.eq('Check bid land error');
        expect(spyLoggerError.args[0][1].service).to.be.eq('bank');
        expect(spyLoggerError.args[0][1].landId).to.be.eq('land_2');
        expect(spyLoggerError.args[0][1].price).to.be.eq('20');
        expect(spyLoggerError.args[0][1].remainFunds.toString() ).to.be.eq('30');
        expect(spyLoggerError.args[0][1].totalFunds.toString() ).to.be.eq('45');
        expect(spyLoggerError.args[0][1].error).to.exist;

        expect(stubBuyLand.callCount).to.be.eq(3);
        expect(stubBuyLand.args[0]).to.be.deep.eq(['land_1', [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000001',
            balance: '10'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '5'
          }
        ] ]);
        expect(stubBuyLand.args[1]).to.be.deep.eq(['land_2', [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '10'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000003',
            balance: '10'
          }
        ] ]);
        expect(stubBuyLand.args[2]).to.be.deep.eq(['land_3', [
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000002',
            balance: '10'
          },
          {
            address: '0x0000000000000000000000000000000000000000000000000000000000000003',
            balance: '10'
          }
        ] ]);

      })

    });

  });

});
