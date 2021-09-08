# PoolTogether Tsunami JS SDK

## How to use
This SDK includes a Typescript model of the Solidity TsunamiDrawCalculator. 
The SDK provides the ability to simulate multiple draw settings and inputs, but also exposes an API to easily check if a User has won a prize for a particular draw. This could also be discovered through the `TsunamiDrawCalculator::calculate()` view function but this SDK is much faster.

### API
```javascript
runTsunamiDrawCalculatorForSingleDraw(drawSettings: DrawSettings, draw: Draw, user: User): DrawResults
```
returns the prize amount for that user, if any.

```javascript
prepareClaimForUserFromDrawResult(user: User, drawResult: DrawResults): Claim
```
prepares a `Claim` for a user. It is intended to be called with the result of`runTsunamiDrawCalculatorForSingleDraw()`

----

```javascript
runTsunamiDrawCalculatorForDraws(drawSettings: DrawSettings[], draw: Draw[], user: User): DrawResults[]
```
returns the prize amount for that user, if any.

```javascript
prepareClaimsForUserFromDrawResults(user: User, drawResult: DrawResults[]): Claim
```

Are wrapped versions of the singular`runTsunamiDrawCalculatorForSingleDraw()` and `prepareClaimForUserFromDrawResult()` functions that take multiple draws and draw settings.

```



Types:
```javascript
// DrawSettings are a protocol level setting (currently set by contract owner)
type DrawSettings  = {
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


