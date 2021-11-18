import { BigNumber, constants } from 'ethers';
import { PrizeDistribution } from '../types';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

export function calculateNumberOfPicksForUser(
    prizeDistribution: PrizeDistribution,
    normalizedBalance: BigNumber,
): number {
    const numberOfPicksForDraw = prizeDistribution.numberOfPicks;
    debug(
        `numberOfPicksForDraw: ${JSON.stringify(
            numberOfPicksForDraw,
        )}, normalizedBalance: ${normalizedBalance}`,
    );

    return BigNumber.from(numberOfPicksForDraw)
        .mul(BigNumber.from(normalizedBalance))
        .div(constants.WeiPerEther)
        .toNumber();
}
