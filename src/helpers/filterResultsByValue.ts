import { BigNumber } from 'ethers';
import { DrawResults, PrizeAwardable } from '../types';
import { sortByBigNumber } from './sortByBigNumber';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

/**
 * Filters out prizes if:
 * - there's more prizes than the max picks per user
 * - the prize won is 0 tokens
 *
 * Sorts prizes by descending value too.
 * @param drawResults
 * @param maxPicksPerUser
 * @returns
 */
export function filterResultsByValue(
    drawResults: DrawResults,
    maxPicksPerUser: number,
): DrawResults {
    // sort by value
    let newPrizes = drawResults.prizes.filter(filterZeroPrizeAmount).sort(sortByPrizeAmount);
    let newTotalValue = drawResults.totalValue;

    // If there's too many prizes to claim, slice & sum total value
    if (drawResults.prizes.length > maxPicksPerUser) {
        debug(
            `user has more claims (${drawResults.prizes.length}) than the max picks per user (${maxPicksPerUser}). Sorting..`,
        );
        newPrizes = newPrizes.slice(0, maxPicksPerUser);
        newTotalValue = newPrizes.reduce(
            (accumulator, currentValue) => accumulator.add(currentValue.amount),
            BigNumber.from(0),
        );
    }

    return {
        ...drawResults,
        totalValue: newTotalValue,
        prizes: newPrizes,
    };
}

const sortByPrizeAmount = (a: PrizeAwardable, b: PrizeAwardable) =>
    sortByBigNumber(a.amount, b.amount);

const filterZeroPrizeAmount = (prizeAwardable: PrizeAwardable) => !prizeAwardable.amount.isZero();
