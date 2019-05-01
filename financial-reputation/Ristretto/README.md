# Ristretto
Ristretto is a Peer to Peer lending platform where the debt is backed by friends, family or people that trust in the borrower.

[![Netlify Status](https://api.netlify.com/api/v1/badges/8d4a66e7-4a34-496b-8e9e-64eac772d14d/deploy-status)](https://app.netlify.com/sites/nervous-banach-90fc9b/deploys)

## Demo
- **Video Demo:** https://www.youtube.com/watch?v=e0EjiaDC6rk
- **Frontend URL:** https://ristretto-affogato.netlify.com
- **Rinkeby Address:** [0xdA4C07B7159C6302330cA947089893018D382EE3](https://rinkeby.etherscan.io/address/0xda4c07b7159c6302330ca947089893018d382ee3)
- **Sokol POA Address:** [0x902C68ED3bde2e270a747A507BF59329ba33fbfC](https://blockscout.com/poa/sokol/address/0x902c68ed3bde2e270a747a507bf59329ba33fbfc/transactions)


## Instructions
The users can have different roles in the platform, they can be *Endorsers*, *Borrowers* or *Lenders*.

### Endorser
The endorsers are friends or family of the borrower, they
trust that the borrower is able to pay and is a honest person.
These users are the ones that takes the risk when an user
doesn't pay a debt, the risk is divided between all the
endorsers of a borrower.

**Actions**:
- Stake Money
- Endorse Users
- Earn interest money from honest borrower
- Close Debt

### Borrower
Borrowers are the users that require money. In order for a
borrower to request a lending they first need other users to
endorse them.

**Actions:**

- Receive Endorsement
- Request Lending
- Receive Money
- Repay Money + 5% Interest in less than 2 months
- Close Debt

### Lender
Lenders are the users that provide the money for a borrower,
they can analize if a borrower has many endorsers and are able
to provide the money for it's debt.

**Actions:**
- Lend Money
- Regain your Money plus an interest
- Close Debt

*If in two months the borrower doesn't pay anyone can call
Force Close Debt and the endorsers will pay the lending*

## Installation

Clone the project on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need truffle, ganache, truffle-hdwallet-provider, openzeppelin-solidity, dotenv and chai in order to run the project

```
npm install -g truffle
npm install -g ganache-cli
npm install
cd client
npm install
```

### Running and Testing

Run ganache application or the cli in order to start testing with the network

```
ganache-cli
```

Compile the project

```
truffle compile 
```

End with running the tests. Affogato uses Chai as an assertion library 

```
truffle test 
```

## Starting the client

Once the ganache is running you just need to start the client and start using the app with metamask in your favorite browser. Run the following commands:

```
cd client
npm start
``` 

## Deployment

### Local Testnet

With ganache running just migrate the project and you will be ready.

```
truffle migrate
``` 

### Rinkeby Testnet

Create a .env file with the following values:

```
MNENOMIC="MNEMONIC KEY OF ACCOUNT WITH RINKEBY ETH"
RINKEBY_API_URL="Rinkeby api URL"
``` 

Run migration with the rinkeby network

```
truffle migrate --network rinkeby
``` 

### Sokol POA Testnet

Create a .env file with the following values:

```
MNENOMIC="MNEMONIC KEY OF ACCOUNT WITH SPOA"
``` 

Run migration with the sokol network

```
truffle migrate --network sokol
``` 