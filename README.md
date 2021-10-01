<p align="center">
  <a href="https://github.com/pooltogether/pooltogether--brand-assets">
    <img src="https://github.com/pooltogether/pooltogether--brand-assets/blob/977e03604c49c63314450b5d432fe57d34747c66/logo/pooltogether-logo--purple-gradient.png?raw=true" alt="PoolTogether Brand" style="max-width:100%;" width="200">
  </a>
</p>

<br />

# PoolTogether Draw Calculator JS

[![Coveralls](https://github.com/pooltogether/draw-calculators-js/actions/workflows/main.yml/badge.svg)](https://github.com/pooltogether/draw-calculators-js/actions/workflows/main.yml)
[![npm version](https://badge.fury.io/js/@pooltogether%2Fdraw-calculator-js.svg)](https://badge.fury.io/js/@pooltogether%2Fdraw-calculator-js)
[![TypeScript definitions on DefinitelyTyped](https://definitelytyped.org/badges/standard.svg)](https://definitelytyped.org)

This library includes a stateless Typescript model of the Solidity DrawCalculator. It is intended to be uses as a tool to easily check if a User has won a prize for a particular draw. This could also be calculated on-chain through the `DrawCalculator::calculate()` view function but this library is much faster.

# Setup

This project is available as an NPM package:

```bash
$ yarn add @pooltogether/draw-calculator-js
```

# How to use

To create a claim or calculate winnings for an address:

1. Run `yarn add @pooltogether/draw-calculator-js` in your project to install the package.
1. Import the desired functions and types: `import {drawCalculator, Draw, PrizeDistribution, generatePicks, prepareClaims } from "@pooltogether/draw-calculator-js"`

Starting with a particular `drawId` and `userAddress`, fetch the Draw information from the DrawHistory contract:

```js
const drawHistory: Contract = new ethers.Contract(address, drawHistoryAbi, signerOrProvider);
const drawId: number = await drawHistory.getNewestDraw(); // can go back cardinality in time (8 draws)
const draw: Draw = await drawHistory.functions.getDraw(drawId); // read-only rpc call
```

Next fetch the PrizeDistribution for the `drawId` from the PrizeDistributionHistory contract:

```javascript
// get PrizeDistribution from the  DrawCalculatorHistory contract for a particular drawId
const prizeDistributionHistoryContract: Contract = new ethers.Contract(
    address,
    drawSettingHistoryAbi,
    signerOrProvider,
);
const prizeDistribution = await prizeDistributionHistoryContract.functions.getPrizeDistribution(
    drawId,
); // read-only rpc call
```

Next, get the users balance using the convenient `getNormalizedBalancesForDrawIds(address _user, uint32[] calldata _drawIds)` view method
on the DrawCalculator contract which returns an array of balances for drawIds:
W

```js
const drawCalculator: Contract = new ethers.Contract(address, drawCalculatorAbi, signerOrProvider);
const balances = await drawCalculator.functions.getNormalizedBalancesForDrawIds(userAddress, [
    drawId,
]); // read-only rpc call
```

Run this `draw-calculator-js` library locally to see the user has any prizes to claim:

```js
const exampleUser: User = {
    address: userAddress // user address we want to calculate for
    normalizedBalances: balances
}

const results: DrawResults = batchCalculateDrawResults([prizeDistribution], [draw], exampleUser)
```

The `results.totalValue` field should indicate the total amount of prize available for `userAddress` for the `drawId`.

Finally, to claim a prize, forward these `DrawResults` to `prepareClaims(user: User, drawResult: DrawResults[])` to generate the data for the on-chain DrawPrize `claim()` call:

```js
const claim: Claim = prepareClaims(user, [results]);
```

The on-chain call to `DrawPrize::claim(address _user, uint32[] calldata _drawIds, bytes calldata _data)` can then be populated and called with this data:

```js
const drawPrizeContract = new ethers.Contract(address, drawPrizeAbi, signerOrProvider);
await drawPrizeContract.functions.claim(claim.userAddress, claim.drawIds, claim.data); //write rpc call
```

Congratulations you have now claimed a prize!

# API Guide

todo.

# Types

A full breakdown of the types can be found [here](./src/types.ts)

# Testing

Unit tests can be run using:

```bash
$ yarn test
```

# Development

Fork/clone this repo. Create a pull request with the changes you would like to make. Unit tests must be passing.
