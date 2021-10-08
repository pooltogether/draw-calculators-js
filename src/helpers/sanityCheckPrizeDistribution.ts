import { BigNumber, ethers } from 'ethers';
import { PrizeDistribution } from '../types';

// checks that the PrizeDistribution are appropriate
export function sanityCheckPrizeDistribution(prizeDistribution: PrizeDistribution): string {
    if (prizeDistribution.bitRangeSize >= Math.floor(256 / prizeDistribution.matchCardinality)) {
        return 'DrawCalc/bitRangeSize-too-large';
    } else {
        let sum = BigNumber.from(0);
        for (let i = 0; i < prizeDistribution.distributions.length; i++) {
            sum = sum.add(prizeDistribution.distributions[i]);
        }
        if (sum.gt(ethers.utils.parseEther('1'))) {
            return 'DrawCalc/distributions-gt-100%';
        }
    }
    return ''; // no error -> sane settings
}
