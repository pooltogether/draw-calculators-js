# PoolTogether Tsunami JS SDK

## How to use
This SDK includes a Typescript model of the Solidity TsunamiDrawCalculator. 
The SDK provides the ability to simulate multiple draw settings and inputs, but also exposes an API to easily check if a User has won a prize for a particular draw. This could also be discovered through the `TsunamiDrawCalculator::calculate()` view function but this SDK is much faster.

### API
```javascript
runDrawCalculatorForSingleDraw(drawSettings: DrawSettings, draw: Draw, user: User): BigNumber
```

returns the prize amount for that user, if any.

Types:
```javascript
// DrawSettings are a protocol level setting (currently set by contract owner)
type DrawSettings  = {
    matchCardinality: BigNumber
    pickCost: BigNumber
    distributions: BigNumber[]
    bitRangeValue: BigNumber
    bitRangeSize: BigNumber
}

// Draw is historical information about the draw
type Draw = {
    prize: BigNumber // this is the awardable amount from the prize pool
    winningRandomNumber: BigNumber // random number returned from the RNG
}

// User inputs
type User = {
    address: string
    balance: BigNumber // Corresponding to timestamp of Draw
    pickIndices: BigNumber[]
}
```


