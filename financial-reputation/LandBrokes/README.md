# LandBrokes
### Helping millennials get the best bang for their buck

## Industries and user

This dApp is focused on the (digital) real estate and gaming industries as Decentraland is a mix of the two. Our primary user is either a Gen-Z (22-24 years old) or millenial (25 - 30 years old) who wants to get a better return on capital than the ones offered by banks. At the same time, the users do not need to be familiar with cryptocurrencies as we want to let people invest with fiat and we'll work with crypto in the background.

## Project Description

LandBrokes is a dApp where people will be able to invest with fiat and get slices of Decentraland LAND. LandBrokes will also have a credit scoring system which will help Decentraland users find better matches for mortgages.

With LandBrokes many addresses can pool together MANA and buy LAND. The LAND will be locked in a smart contract and a new ERC20 contract will be generated where the addresses that pooled MANA will get "slices" of LAND. This way we reduce the amount someone needs to pay in order to invest in Decentraland assets. Moreover, we want to let users contribute MANA by first sending fiat and exchanging that with crypto in the background.

On the credit scoring side we will take into account multiple factors such as how many times an address seeked a mortgage in the last 6 months and how many times an address defaulted in paying back their mortgage. At the same time, we have a couple of experiments going on: users will be able to vote on the formula used to compute the credit score and propose alternatives and we're sketching a smart contract where users can lend credit points to one another.

## Insights

We want to manage our investors' money, buy LAND with it and then manage the bought LAND in order to generate revenue. From our discussion with the DCL community we found out that renting LAND might not be feasible since there are vast areas of LAND where it's free to build on. Also, we found out that it's more feasible to let our investors rent slices of LAND compared to buying and holding them forever. That is because LAND can be recomposed out of all the slices and if an address needs 1 more slice to recreate the LAND, the entity who was that last slice can charge a huge premium, making it unfeasible to recompose the LAND.

## Traction

We started advertising the project on Decentraland's Discord on Wednesday 24/04/2019 and on /r/ethereum on 28/04/2019

The link for the /r/ethereum post:

https://www.reddit.com/r/ethereum/comments/bidkfd/decentralized_credit_scoring_and_investment/

We received 2 subscribers through our Mailchimp landing page:

https://mailchi.mp/9cb7025812a1/landbrokes

Here is an exerpt from a discussion we had with some Decentraland users:

https://docs.google.com/document/d/15TcmhiAd8Vg0YWVWQav_W3gveNpJ7lNLo0WdB6LsEZI/edit?usp=sharing

## Industry Disruption

Decentraland recently released their tool to allow anyone to build on top of their LAND and we believe that in the next 12 months there will be users building virtual businesses that sell collectibles and generate revenue. We want to allow fiat users to invest through us in DCL assets that we manage on their behalf and then give them most of the revenue generated. This way we want to disrupt the notion of "real" estate and show average people that they can get hefty returns from digital estate.

## Blockchain Value

The name of the game is transparency. Blockchain gives our users the possibility to trace their money and see exactly what decisions we take to multiply their capital. Also, we cannot cheat and say that we got a return of 5% on capital where in reality it was 10% and we pocketed the remaining 5% without letting our users know.

## Development Progress

__Live frontend demo here__:

https://land-brokes.netlify.com/

We built the components for the dApp (frontend, backend and contracts) but did not connect them. If you want to try out what we built, clone this repo and:

* For the frontend, __cd frontend__, __yarn install__ and then __yarn start__; go to localhost:3000 and use Metamask (any network) to access the dashboard

* The contracts are in __chain__; the ones in __bankContracts__ are specific to our solution whereas the ones in __landSC__ are the Decentraland contracts we use locally

* All the backend utilities are in __backend__

We also outlined what factors we take into account when computing credit scores:

https://bit.ly/2PB1rV0

## Industry Expert

Esteban Ordano, the CTO of Decentraland, likes our project and wants to advise us. Unfortunately, he did not have time for a first call during the competition although we booked a call with him on Wednesday, 01/05/2019.
