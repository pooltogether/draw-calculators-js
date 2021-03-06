import { utils } from 'ethers';
import { generatePicks } from './generatePicks';
import { sanityCheckPrizeDistribution } from './helpers/sanityCheckPrizeDistribution';
import { Draw, DrawResults, PrizeDistribution, User } from './types';
import { computeDrawResults } from './computeDrawResults';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

export function calculateDrawResults(
    prizeDistribution: PrizeDistribution,
    draw: Draw,
    user: User,
    drawIndex: number = 0,
): DrawResults {
    debug(
        `calculateDrawResults() called with args ${JSON.stringify(
            prizeDistribution,
        )}, ${JSON.stringify(draw)}, ${JSON.stringify(user)}`,
    );
    // first check PrizeDistribution passed is sane
    const sanityCheckPrizeDistrbutionResult = sanityCheckPrizeDistribution(prizeDistribution);
    if (sanityCheckPrizeDistrbutionResult != '') {
        throw new Error(
            `draw-calculator-js PrizeDistribution invalid: ${sanityCheckPrizeDistrbutionResult}`,
        );
    }

    // generate the picks for the user by hashing the address with the pickIndices
    user.picks = generatePicks(prizeDistribution, user.address, user.normalizedBalances[drawIndex]);
    debug(
        `user ${user.address} has ${user.picks.length} picks for drawId ${draw.drawId}. Computing..`,
    );
    // run the draw calculator matching engine against these picks
    let results: DrawResults = computeDrawResults(prizeDistribution, draw, user.picks);

    debug(
        `user ${user.address} has ${utils.formatEther(results.totalValue)} prizes for this draw..`,
    );
    return results;
}
