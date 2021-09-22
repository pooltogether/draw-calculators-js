import { BigNumber, ethers } from 'ethers';
import { Draw, DrawSettings } from '../types';
import { calculateFractionOfPrize } from './calculateFractionOfPrize';

export function calculatePrizeForDistributionIndex(
    prizeDistributionIndex: number,
    drawSettings: DrawSettings,
    draw: Draw,
): BigNumber {
    // totalPrize *  (distributions[index]/(range ^ index)) where index = matchCardinality - numberOfMatches
    const fractionOfPrize = calculateFractionOfPrize(prizeDistributionIndex, drawSettings);
    let expectedPrizeAmount: BigNumber = drawSettings.prize.mul(fractionOfPrize);
    expectedPrizeAmount = expectedPrizeAmount.div(ethers.constants.WeiPerEther);

    // console.log("expectedPrizeAmount ", utils.formatEther(expectedPrizeAmount))

    return expectedPrizeAmount;
}
