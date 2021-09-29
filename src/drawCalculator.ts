import { BigNumber, utils } from "ethers";
import { Draw, DrawResults, PrizeDistribution, User } from "./types"
import { sanityCheckPrizeDistribution } from "./helpers/sanityCheckPrizeDistribution";
import { computeDrawResults } from "./computeDrawResults";
import { filterResultsByValue } from "./helpers/filterResultsByValue";
import { generatePicks } from "./generatePicks";

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

// main entry point for tsunami draw calculations
export function drawCalculator(prizeDistribution: PrizeDistribution[], draws: Draw[], user: User): DrawResults[] {
    const results: DrawResults[] = []
    draws.forEach((draw, index) => {
        const drawResults = runDrawCalculatorForSingleDraw(prizeDistribution[index], draw, user, index)
        if(drawResults.totalValue.gt(BigNumber.from(0))) {
            results.push(drawResults)
        }
    })
    return results
}

function runDrawCalculatorForSingleDraw(prizeDistribution: PrizeDistribution, draw: Draw, user: User, drawIndex: number): DrawResults {
    // first check PrizeDistribution passed is sane
    const sanityCheckPrizeDistrbutionResult = sanityCheckPrizeDistribution(prizeDistribution)
    if(sanityCheckPrizeDistrbutionResult != ""){
        throw new Error(`draw-calculator-js PrizeDistribution invalid: ${sanityCheckPrizeDistrbutionResult}`)
    }
    
    // generate the picks for the user by hashing the address with the pickIndices
    user.picks = generatePicks(prizeDistribution, user.address, user.normalizedBalances[drawIndex])
    debug(`user ${user.address} has ${user.picks.length} picks for drawId ${draw.drawId}. Computing..`)
    // run the draw calculator matching engine against these picks
    let results: DrawResults = computeDrawResults(prizeDistribution, draw, user.picks)

    debug(`user ${user.address} has ${utils.formatEther(results.totalValue)} prizes for this draw..`)

    // sort the picks by value and filter out if some picks beyond the maxUserPicks
    results = filterResultsByValue(results, prizeDistribution.maxPicksPerUser)

    return results
}