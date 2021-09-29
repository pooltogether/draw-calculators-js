import { BigNumber } from "ethers";
import { Draw, DrawResults, PrizeDistribution, User } from "./types"
import { sanityCheckDrawSettings } from "./helpers/sanityCheckDrawSettings";
import { computeDrawResults } from "./computeDrawResults";
import { filterResultsByValue } from "./helpers/filterResultsByValue";
import { generatePicks } from "./generatePicks";

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

// main entry point for tsunami draw calculations
export function drawCalculator(prizeDistribution: PrizeDistribution[], draws: Draw[], user: User): DrawResults[] {
    const results: DrawResults[] = []
    draws.forEach((draw, index) => {
        const drawResults = runDrawCalculatorForSingleDraw(prizeDistribution[index], draw, user)
        if(drawResults.totalValue.gt(BigNumber.from(0))) {
            results.push(drawResults)
        }
    })
    return results
}

function runDrawCalculatorForSingleDraw(prizeDistribution: PrizeDistribution, draw: Draw, user: User): DrawResults {
    // first check drawSettings passed are sane
    const sanityCheckDrawSettingsResult = sanityCheckDrawSettings(prizeDistribution)
    if(sanityCheckDrawSettingsResult != ""){
        throw new Error(`TsunamiDrawSettings invalid: ${sanityCheckDrawSettingsResult}`)
    }
    
    // generate the picks for the user by hashing the address with the pickIndices
    user.picks = generatePicks(prizeDistribution, user)
    debug(`user has ${user.picks.length} picks`)
    // run the draw calculator matching engine against these picks
    let results: DrawResults = computeDrawResults(prizeDistribution, draw, user.picks)

    // sort the picks by value and filter out if some picks beyond the maxUserPicks
    results = filterResultsByValue(results, prizeDistribution.maxPicksPerUser)

    return results
}