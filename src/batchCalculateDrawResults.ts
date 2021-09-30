import { Draw, DrawResults, PrizeDistribution, User } from './types';
import { calculateDrawResults } from './calculateDrawResults';

// main entry point for tsunami draw calculations
export function batchCalculateDrawResults(
    prizeDistribution: PrizeDistribution[],
    draws: Draw[],
    user: User,
): DrawResults[] {
    const results: DrawResults[] = [];
    draws.forEach((draw, index) => {
        const drawResults = calculateDrawResults(prizeDistribution[index], draw, user, index);
        results.push(drawResults);
    });
    return results;
}
