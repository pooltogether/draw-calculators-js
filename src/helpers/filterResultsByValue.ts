import { BigNumber } from "ethers";
import { DrawResults, PrizeAwardable } from "types";

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

export function filterResultsByValue(drawResults: DrawResults, maxPicksPerUser: number) : DrawResults{
    // if the user has more winning picks than max pick per user for the draw, we sort by value and remove the lowest value picks
    if(drawResults.prizes.length > maxPicksPerUser){
        
        debug(`user has more claims (${drawResults.prizes.length}) than the max picks per user (${maxPicksPerUser}). Sorting..`)
        // sort by value
        const descendingSortedPrizes : PrizeAwardable[]= drawResults.prizes.sort(
            function(a : PrizeAwardable, b: PrizeAwardable) : number {
                const subbedValue = a.amount.sub(b.amount)
                if (subbedValue.isZero()) return 0
                if (subbedValue.isNegative()) return -1
                return 1
            })
        // remove the lowest value picks up to the max picks per user
        const sortedDescendingSortedPrizes = descendingSortedPrizes.slice(0, maxPicksPerUser)
        // sum the sorted values
        const newTotalValue : BigNumber = descendingSortedPrizes.reduce((accumulator, currentValue) => accumulator.add(currentValue.amount), BigNumber.from(0))
        return {
            ...drawResults,
            totalValue: newTotalValue,
            prizes: sortedDescendingSortedPrizes
        } 
    }

    // if not greater than max picks per user, return the whole array
    return drawResults
}
