import { BigNumber } from "ethers";
import { Draw, DrawResults, TsunamiDrawSettings, User, Pick} from "./types"
import { sanityCheckDrawSettings } from "./helpers/sanityCheckDrawSettings";
import { computePicks } from "./computePicks";
import { computeDrawResults } from "./computeDrawResults";
import { calculateNumberOfPicksForUser } from "./helpers/calculateNumberOfPicksForUser"
import { filterPicksByValue } from "helpers/filterResultsByValue";

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

// main entry point for tsunami draw calculations
export function runTsunamiDrawCalculatorForSingleDraw(drawSettings: TsunamiDrawSettings, draw: Draw, user: User): DrawResults {
    // first check drawSettings passed are sane
    const sanityCheckDrawSettingsResult = sanityCheckDrawSettings(drawSettings)
    if(sanityCheckDrawSettingsResult != ""){
        throw new Error(`TsunamiDrawSettings invalid: ${sanityCheckDrawSettingsResult}`)
    }
    // now calculate the number of picks for the user has considering balances and total picks available for that drawSettings
    const totalUserPicks = calculateNumberOfPicksForUser(drawSettings, user.normalizedBalance)
    
    debug(`totalUserPicks ${totalUserPicks}`)
    
    // if the user does not have as many picks as they are allocated  - then throw 
    user.pickIndices.find((value) => {
        if (value >= totalUserPicks) {
            throw new Error(`User does not have this many picks! ${value} totalUserPicks ${totalUserPicks} ${value >= totalUserPicks}`)
        }
    })
    // generate the picks for the user by hashing the address with the pickIndices
    const picks: Pick[] = computePicks(user.address, user.pickIndices)

    // run the draw calculator matching engine against these picks
    let results: DrawResults = computeDrawResults(drawSettings, draw, picks)

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