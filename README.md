# PoolTogether Draw Calculator JS

## How to use
This library includes a stateless Typescript model of the Solidity TsunamiDrawCalculator. It is intended to be uses as a tool to easily check if a User has won a prize for a particular draw. This could also be discovered through the `TsunamiDrawCalculator::calculate()` view function but this SDK is much faster.

The SDK also provides the ability to simulate multiple draw settings and inputs.  

To use: 
1. Run `yarn add @pooltogether/draw-calculator-js-sdk` in your project to install the package.
1. Import the desired functions and types: `import {runTsunamiDrawCalculatorForSingleDraw, Draw, TsunamiDrawSettings } from "@pooltogether/draw-calculator-js-sdk/dist/src"`
1. Call the function:
```javascript
// get TsunamiDrawSettings from the Tsunami Draw Calculator contract for a particular drawId
const exampleDrawSettings : TsunamiDrawSettings = {
    distributions: [ethers.utils.parseEther("0.3"),
                    ethers.utils.parseEther("0.2"),
                    ethers.utils.parseEther("0.1")],
    pickCost: ethers.utils.parseEther("1"),
    matchCardinality: BigNumber.from(3),
    bitRangeSize : BigNumber.from(4),
    prize: BigNumber.from(utils.parseEther("100")),
}

// populate the Draw type for a particular drawId from the Draw History contract
const exampleDraw : Draw = {
    drawId: BigNumber.from(1),
    winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
}

// populate the User type (with Ticket balance for that drawId timestamp and appropriate pickIndices)
const exampleUser : User = {
    address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    balance: ethers.utils.parseEther("10"),
    pickIndices: [BigNumber.from(1)]
} 
// finally call function
const results: DrawResults = runTsunamiDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
```


### API
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

### Types:
A full breakdown of the types can be found [here](./src/types.ts)

```javascript
// TsunamiDrawSettings are a protocol level setting (currently set by contract owner)
type TsunamiDrawSettings  = {
    matchCardinality: BigNumber
    pickCost: BigNumber
    distributions: BigNumber[]
    bitRangeSize: BigNumber
    prize: BigNumber // this is the awardable amount from the prize pool
}

// Draw is historical information about the draw -- obtainable from the DrawHistory
type Draw = {
    drawId: BigNumber
    winningRandomNumber: BigNumber // random number returned from the RNG service
}

// User inputs
type User = {
    address: string
    balance: BigNumber // Corresponding to timestamp of Draw
    pickIndices: BigNumber[]
}
```


