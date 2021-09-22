import { BigNumber, ethers, utils } from 'ethers';
import { DrawSettings } from '../types';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

const bn = (val: string) => ethers.BigNumber.from(val);

export function calculateFractionOfPrize(
    prizeDistributionIndex: number,
    drawSettings: DrawSettings,
): BigNumber {
    const numberOfPrizes = BigNumber.from(2)
        .pow(drawSettings.bitRangeSize)
        .pow(BigNumber.from(prizeDistributionIndex));
    debug('numberOfPrizes for index ', numberOfPrizes);

    const valueAtDistributionIndex: BigNumber = bn(
        String(drawSettings.distributions[prizeDistributionIndex]),
    );
    debug('valueAtDistributionIndex ', drawSettings.distributions[prizeDistributionIndex]);

    const fractionOfPrize: BigNumber = valueAtDistributionIndex.div(numberOfPrizes);
    debug('fractionOfPrize: ', utils.formatEther(fractionOfPrize));
    return fractionOfPrize;
}
