# PoolTogether Draw Calculator JS
This library includes a stateless Typescript model of the Solidity TsunamiDrawCalculator. It is intended to be uses as a tool to easily check if a User has won a prize for a particular draw. This could also be calculated on-chain through the `TsunamiDrawCalculator::calculate()` view function but this library is much faster.

## How to use
To create a `claim` or calculate winnings for an address:
1. Run `yarn add @pooltogether/draw-calculator-js` in your project to install the package.
1. Import the desired functions and types: `import {runTsunamiDrawCalculatorForSingleDraw, Draw, TsunamiDrawSettings, generatePicks, prepareClaimForUserFromDrawResult } from "@pooltogether/draw-calculator-js"`

Starting with a particular drawId, fetch the Draw information from the DrawHistory contract:

```js
const drawHistory = new ethers.Contract(address, drawHistoryAbi, signerOrProvider)
const exampleDraw = await drawHistory.functions.getDraw(drawId) // rpc call

where: 
type Draw = {
    drawId: BigNumber
    winningRandomNumber: BigNumber
    timestamp: BigNumber
}
```

Next fetch the TsunamiDrawSettings from the TsunamiDrawSettingsHistory contract:

```javascript
// get TsunamiDrawSettings from the Tsunami Draw Calculator contract for a particular drawId
const drawId = 119
const drawSettingsHistoryContract = new ethers.Contract(address, drawSettingHistoryAbi, signerOrProvider)
const drawSettings = await drawSettingsHistoryContract.functions.getDrawSettings(drawId) // read-only rpc call
```

where: 

```js
type TsunamiDrawSettings = {
    matchCardinality: BigNumber;
    numberOfPicks: BigNumber;
    distributions: BigNumber[];
    bitRangeSize: BigNumber;
    prize: BigNumber;
    drawStartTimestampOffset?: BigNumber; // optional for this lib
    drawEndTimestampOffset?: BigNumber; // optional for this lib
    maxPicksPerUser: BigNumber;
}
```

Next, get the users balance using the convenient `getNormalizedBalancesForDrawIds(address _user, uint32[] calldata _drawIds)` view method
on the TsunamiDrawCalculator contract which returns an array of balances for those timestamps.

```js
const drawCalculator = new ethers.Contract(address, drawCalculatorAbi, signerOrProvider)
const balances = await drawCalculator.functions.getNormalizedBalancesForDrawIds(_user, [drawId]) // read-only rpc call
```

Generate the pickIndices input using the `generatePicks(drawSettings: TsunamiDrawSettings, user: User) : Pick[]` helper function in this library.

```js
const picks : Pick[] = generatePicks(drawSettings, user) 

// populate the User type (with Ticket balance for that drawId timestamp and appropriate pickIndices)
const exampleUser : User = {
    address: _user,
    balance: balances[0],
    pickIndices: picks
} 
```

Run the Tsunami Draw Calculator locally to see the user has any prizes to claim:
```js
const results: DrawResults = runTsunamiDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
```

Finally, to claim a prize, forward these `DrawResults` to `prepareClaimForUserFromDrawResult(user: User, drawResult: DrawResults)` to generate the data for the on-chain ClaimableDraw `claim()` call:

```js
const claim: Claim = prepareClaimForUserFromDrawResult(user, result)

where:
type Claim = {
    userAddress: string
    drawIds: BigNumber[]
    data: BigNumber[][]
}
```

The on-chain call to `ClaimableDraw::claim(address _user, uint32[] calldata _drawIds, bytes calldata _data)` can then be populated and called with this data:

```js
const claimableDrawContract = new ethers.Contract( address , claimableDrawAbi , signerOrProvider )
await claimableDrawContract.functions.claim(claim.userAddress, claim.drawIds, claim.data) //write rpc call
```


## API Guide
```javascript
runTsunamiDrawCalculatorForSingleDraw(drawSettings: TsunamiDrawSettings, draw: Draw, user: User): DrawResults
```
returns the prize amount for that user, if any.

```javascript
prepareClaimForUserFromDrawResult(user: User, drawResult: DrawResults): Claim
```
prepares a `Claim` for a user. It is intended to be called with the result of`runTsunamiDrawCalculatorForSingleDraw()`

----
Versions of the singular`runTsunamiDrawCalculatorForSingleDraw()` and `prepareClaimForUserFromDrawResult()` functions that take multiple draws and draw settings are also available:

```javascript
runTsunamiDrawCalculatorForDraws(drawSettings: TsunamiDrawSettings[], draw: Draw[], user: User): DrawResults[]
```
and 
```javascript
prepareClaimsForUserFromDrawResults(user: User, drawResult: DrawResults[]): Claim
```

## Types:
A full breakdown of the types can be found [here](./src/types.ts)

