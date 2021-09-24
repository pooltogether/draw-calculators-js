import { BigNumber } from "ethers";
import { Draw, DrawResults, TsunamiDrawSettings, User } from "./types"
import { sanityCheckDrawSettings } from "./helpers/sanityCheckDrawSettings";
import { computeDrawResults } from "./computeDrawResults";
import { filterPicksByValue } from "./helpers/filterResultsByValue";
import { generatePicks } from "./generatePicks";

// const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

// main entry point for tsunami draw calculations
export function runTsunamiDrawCalculatorForSingleDraw(drawSettings: TsunamiDrawSettings, draw: Draw, user: User): DrawResults {
    // first check drawSettings passed are sane
    const sanityCheckDrawSettingsResult = sanityCheckDrawSettings(drawSettings)
    if(sanityCheckDrawSettingsResult != ""){
        throw new Error(`TsunamiDrawSettings invalid: ${sanityCheckDrawSettingsResult}`)
    }
    // now calculate the number of picks for the user has considering balances and total picks available for that drawSettings

    // generate the picks for the user by hashing the address with the pickIndices
    user.picks = generatePicks(drawSettings, user)

    // run the draw calculator matching engine against these picks
    let results: DrawResults = computeDrawResults(drawSettings, draw, user.picks)

    // sort the picks by value and filter out if some picks beyond the maxUserPicks
    results = filterPicksByValue(results, drawSettings)

    return results
}

// multiple version of runTsunamiDrawCalculatorForSingleDraw
export function runTsunamiDrawCalculatorForDraws(drawSettings: TsunamiDrawSettings[], draws: Draw[], user: User): DrawResults[] {
    const results: DrawResults[] = []
    draws.forEach((draw, index) => {
        const drawResults = runTsunamiDrawCalculatorForSingleDraw(drawSettings[index], draws[index], user)
        if(drawResults.totalValue.gt(BigNumber.from(0))) {
            results.push(drawResults)
        }
    })
    return results
}