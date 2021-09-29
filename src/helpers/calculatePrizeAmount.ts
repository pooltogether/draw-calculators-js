import { PrizeDistribution, Draw, PickPrize } from "../types"
import { calculatePrizeForDistributionIndex } from "./calculatePrizeForDistributionIndex"

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

// calculates the absolute amount of Prize in Wei for the Draw and TsunamiDrawSettings
export function calculatePrizeAmount(prizeDistribution: PrizeDistribution, draw: Draw, matches :number): PickPrize | undefined{ // returns the prize you would receive for drawSettings and number of matches

    const distributionIndex = prizeDistribution.matchCardinality - matches
    debug(`distributionIndex: ${distributionIndex}, : (${prizeDistribution.matchCardinality} - ${matches} )`)

    if(distributionIndex < prizeDistribution.distributions.length){
        // user *may* be getting a prize
        const expectedPrizeAmount = calculatePrizeForDistributionIndex(distributionIndex, prizeDistribution, draw)
        return {
            amount: expectedPrizeAmount,
            distributionIndex
        } 
    }
    // user did not qualify for a prize
    return undefined
}