import { BigNumber, utils } from 'ethers';
import { expect } from 'chai';
import { PrizeDistribution } from '../src/types';
import { calculateNumberOfPrizesForIndex } from '../src/helpers/calculateNumberOfPrizesForIndex';
import { formatDistributionNumber } from '../src/helpers/formatDistributionNumber';

describe('calculateNumberOfPrizesForIndex()', () => {
    it('returns the correct number of winners', async () => {
        // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) - 2 ^ (bitRangeSize ^ distributionIndex - 1)= 2 ^ (4 ^ 1) = 16 - 1 = 15
        const examplePrizeDistribution: PrizeDistribution = {
            tiers: [
                formatDistributionNumber('0.3'),
                formatDistributionNumber('0.2'),
                formatDistributionNumber('0.1'),
            ],
            numberOfPicks: BigNumber.from(10),
            matchCardinality: 3,
            bitRangeSize: 4,
            prize: BigNumber.from(utils.parseEther('100')),
            maxPicksPerUser: 1000,
        };

        const numberOfWinners = calculateNumberOfPrizesForIndex(
            examplePrizeDistribution.bitRangeSize,
            1,
        );
        expect(numberOfWinners).to.equal(15); // 1.33333e18
    });
});
