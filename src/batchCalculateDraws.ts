import { Draw, DrawResults, PrizeDistribution, User } from "./types"
import { calculateDraw } from "./calculateDraw";


// main entry point for tsunami draw calculations
export function batchCalculateDraws(prizeDistribution: PrizeDistribution[], draws: Draw[], user: User): DrawResults[] {
    const results: DrawResults[] = []
    draws.forEach((draw, index) => {
        const drawResults = calculateDraw(prizeDistribution[index], draw, user, index)
        results.push(drawResults)
    })
    return results
}
