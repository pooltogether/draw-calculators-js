import { BigNumber } from "ethers";
import { DrawResults, PrizeAwardable, TsunamiDrawSettings } from "types";


export function filterPicksByValue(drawResults: DrawResults, drawSettings: TsunamiDrawSettings) : DrawResults{
    // if the user has more winning picks than max pick per user for the draw, we sort by value and remove the lowest value picks
    if(drawResults.prizes.length > drawSettings.maxPicksPerUser){
        // sort by value
        const descendingSortedPrizes : PrizeAwardable[]= drawResults.prizes.sort(
            function(a : PrizeAwardable, b: PrizeAwardable) : number {
                return (a.amount.sub(b.amount)).toNumber() // what if this is too large for toNumber?
            })
        // remove the lowest value picks up to the max picks per user
        const sortedDescendingSortedPrizes = descendingSortedPrizes.slice(0, drawSettings.maxPicksPerUser)
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
