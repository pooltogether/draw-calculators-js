import { BigNumber, constants } from 'ethers';
import { PrizeDistribution } from '../types';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

export function calculateNumberOfPicksForUser(
    drawSettings: PrizeDistribution,
    normalizedBalance: BigNumber,
): number {
    const numberOfPicksForDraw = drawSettings.numberOfPicks;
    debug(`numberOfPicksForDraw: ${numberOfPicksForDraw} `)
    debug(`normalizedBalance: ${normalizedBalance} `)
    return numberOfPicksForDraw.mul(normalizedBalance).div(constants.WeiPerEther).toNumber();
}
