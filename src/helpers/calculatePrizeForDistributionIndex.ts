import { BigNumber, ethers } from 'ethers';
import { PrizeDistribution } from '../types';
import { calculateFractionOfPrize } from './calculateFractionOfPrize';

export function calculatePrizeForDistributionIndex(
    distributionIndex: number,
    prizeDistrbution: PrizeDistribution,
): BigNumber {
    // totalPrize *  (tiers[index]/(range ^ index)) where index = matchCardinality - numberOfMatches
    const fractionOfPrize = calculateFractionOfPrize(distributionIndex, prizeDistrbution);
    let expectedPrizeAmount: BigNumber = prizeDistrbution.prize.mul(fractionOfPrize);
    expectedPrizeAmount = expectedPrizeAmount.div(ethers.constants.WeiPerEther);

    // console.log("expectedPrizeAmount ", utils.formatEther(expectedPrizeAmount))

    return expectedPrizeAmount;
}
