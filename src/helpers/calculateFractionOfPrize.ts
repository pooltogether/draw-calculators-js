import { parseUnits } from '@ethersproject/units';
import { BigNumber, utils } from 'ethers';
import { PrizeDistribution } from '../types';
import { calculateNumberOfPrizesForIndex } from './calculateNumberOfPrizesForIndex';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

export function calculateFractionOfPrize(
    prizeDistributionIndex: number,
    drawSettings: PrizeDistribution,
): BigNumber {
    const numberOfPrizes = calculateNumberOfPrizesForIndex(
        drawSettings.bitRangeSize,
        prizeDistributionIndex,
    );

    debug('numberOfPrizes for index ', numberOfPrizes);

    const valueAtDistributionIndex = drawSettings.distributions[prizeDistributionIndex];
    debug('valueAtDistributionIndex ', utils.formatEther(valueAtDistributionIndex.toString()));

    const valueAtDistributionIndexUnformatted = parseUnits(String(valueAtDistributionIndex), 9);

    const fractionOfPrize = valueAtDistributionIndexUnformatted.div(numberOfPrizes);
    debug('fractionOfPrize: ', utils.formatEther(fractionOfPrize));
    return fractionOfPrize;
}
