SmartPiggies
<img align="right" width="300" src="app/src/Assets/Logo/piggieface_02.png">
=

An open source standard for a free peer-to-peer global derivatives market.
-

### The initial work for this submission was done in this [repo](https://github.com/smartpiggies/amerigo/tree/master/explorer2): please view it for proof of commits to the work process.

A hosted version of this dapp can be viewed at [explorer.smartpiggies.com](https://explorer.smartpiggies.com).

SmartPiggies are non-fungible digital contracts that provide their owners with protection against undesirable changes in the price of any asset, product, or service. They also have a native self-auctioning mechanism that allows them to globally market themselves, eliminating the need for exchanges.

Historically, centralized authorities and rent collecting intermediaries have been  necessary due the trust and guarantees they inject into modern financial commitments. Today, with the guarantees provided by the Ethereum network and recent innovations provided by the global community, it is now possible to create robust programmable digital assets linked to the real world prices that have no dependencies on centralized authorities or intermediaries.

SmartPiggies are an example of simple, useful, globally accessible, peer-to-peer financial agreements that can exist on the Ethereum network today. 

For more information on the project and to read the pinkpaper please visit the [website](https://smartpiggies.com).

## Work done during the hackathon

For the Ethereal Hackathon we implemented the Aleth.io APIs in a React dapp to build out a token explorer for SmartPiggies. Our explorer, which we named Amerigo, constructs a React UI, using Aleth.io and Drizzle, that allows users to explore SmartPiggies non-fungible tokens. Amerigo retrieves the event data emitted from the SmartPiggies contract and displays this token data in a helpful format so users can view the current real-time global market for SmartPiggies NFTs.

SmartPiggies tokens hold many parameters as well as auction information. The explorer is a critical tool for token introspection and provides market making opportunities for users.

To provide users this information we use the the Aleth.io API endpoint,

`https://api.goerli.aleth.io/v1/contracts/{contract}/logEntries`

to fetch all event information from the SmartPiggies contract.

We filter for creation events and then call,

`https://api.aleth.io/v1/log-entries/{id}/transaction`

to fetch the transaction associated with the creation of a new token.


We filter this transaction information to extract a contract address for an oracle resolver that was included as an argument to create the token. We make a call with this address to,

`https://api.goerli.aleth.io/v1/contracts/{address}`

to fetch the oracle resolver parameters supplied during its creation. From this we get information about the associated oracle which will be called during the settlement process.

From the oracle parameters we save the underlying and the data source, and api the oracle will use to return the price. From the other calls we save the token id, strike price, and expiry information for each NFT. We also make an additional filter for auction information that is returned with the first call for `logEntries.`

The dapp displays this information in a component that will provide full token introspection from a clickable dropdown as well as filter options to view only tokens on auction. If the token is on auction, meaning it can be purchased, the dropdown will contain a button for purchase.

Our goal is to continue to build out this design to offer a full feature explorer for the SmartPiggies platform which will include full market introspection, as well as the ability to purchase directly within the explorer.

## A specific industry, user, and use case for which you are solving

SmartPiggies is a decentralized financial product for use by small businesses and individuals to hedge against price movements of any asset, product, or service for which a price can be retrieved,

SmartPiggies are effectively a price insurance product. SmartPiggies are effective for a specified period of time,  maximum amount of coverage, and pays out based on pre-established conditions as would any typical insurance product.

We envision that the primary purchasers of SmartPiggy contracts will be small businesses that are underserved by the global financial system and are exposed to fluctuations in prices for goods, services, and exchange rates that are inherent to their business activities.

## Unique insights about the industry gathered through primary or secondary research

The DeFi industry has spawned a number of lending and derivatives products, as well as novel enabling technologies such as stable tokens intended to peg to the value of “real-world” currencies. However, as far as the team is aware, no product offering price insurance in the manner of SmartPiggies yet exists. The industry in general offers users the potential to earn “passive income” on various lending products, but this often entails turning over control of one’s cryptocurrency to a lending platform with the expectation that one will be compensated in interest, and eventually, the return of one’s principal. With SmartPiggies, underwriters have the potential to earn a “passive” income stream through insurance premia, without turning their funds over to a third party -- all funds remain locked in the SmartPiggies contract with no capability for those funds to be moved by a privileged account. The only factors affecting the ultimate distribution of funds are the parameters of the smart contract which both the underwriter and purchaser agreed to at the time the option was sold.

Other derivatives in the DeFi industry space do not appear to currently offer the flexibility of SmartPiggies, or the ability to easily hedge risks in non-cryptocurrency financial instruments through the use of stable token payouts. The team believes that this capability opens up many more use cases for decentralized derivatives than the industry has thus far offered to customers.

## Proof that the market you've identified is primed to be disrupted in the next 6-12 months

As we have seen significant cryptocurrency adoption in countries where the need is great, we also believe that small businesses and individuals around the world that suffer through fluctuations in price will immediately grasp that SmartPiggies may be useful to them.

In our view, we are not disrupting an existing market. We are creating an ecosystem that generates a financial utility that has never before been available to the vast majority of humanity due to the structural limitations of the existing global financial and legal system.

## Proof that blockchain adds significant value to this solution over centralized alternatives

The current centralized market for bespoke derivatives is largely closed to non-institutional investors, given the relationship nature of the business, and the cost of the infrastructure required for large institutions to manage their derivatives desks and legal teams. However, price insurance is not a tool which only has value to institutional investors -- many small business owners, for example, could likely utilize bespoke options to protect their enterprises from price shocks if they had access to them. With SmartPiggies, such users can realize the value of such insurance, and underwriters wishing to earn income from premia may issue SmartPiggies without being a large financial institution. Thanks to the programmability and security guarantees of the blockchain, the purchaser of a SmartPiggies option does not need to worry about the counterparty risk of any specific underwriter -- all collateral associated with the option is secured on-chain out of the control of either counterparty before the option is even sold. This increase in market access for both buyers and sellers of price insurance marks a definite improvement over the status quo in current centralized markets for bespoke options.

## Project Rollout

Our rollout plans are flexible at the moment.

For now we are focused on on constructing the MVP contracts and minimal UI components.

If we manage to raise funding at some point in the future we can consider outreach and education efforts, a more sophisticated UI, publishing research and use cases, providing a trusted exchange service, and providing liquidity to the market.

As of now we are unfunded and as such our scope is limited to working on an MVP in our spare time.

## Team
[Michael Arief](https://www.linkedin.com/in/mikearief/)
[Toby Algya](https://www.linkedin.com/in/toby-algya-58997712/)
[Alex Lee](https://www.linkedin.com/in/ahlee328/)

## Tech stack

- Ethereum

- Aleth.io

- Goerli Testnet

- Metamask

- Solidity

- OpenZeppelin

- Truffle

- Drizzle

- Ganache

- ReactJS

- NodeJS

- Chainlink
