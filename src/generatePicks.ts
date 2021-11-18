import { BigNumber, ethers } from 'ethers';
import { calculateNumberOfPicksForUser } from './helpers/calculateNumberOfPicksForUser';
import { computePick } from './helpers/computePick';
import { Pick, PrizeDistribution } from './types';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

export function generatePicks(
    prizeDistribution: PrizeDistribution,
    address: string,
    normalizedBalance: BigNumber,
): Pick[] {
    debug(`generatePicks::normalizedBalance ${normalizedBalance}`);
    let numberOfPicks = calculateNumberOfPicksForUser(prizeDistribution, normalizedBalance);

    const usersAddressHashed = ethers.utils.solidityKeccak256(['address'], [address]);

    let picks: Pick[] = [];

    for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
        picks.push(computePick(usersAddressHashed, pickIndex));
    }
    return picks;
}
