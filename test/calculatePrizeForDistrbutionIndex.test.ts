import { BigNumber, utils } from 'ethers';
import { expect } from 'chai';
import { PrizeDistribution } from '../src/types';

import { calculatePrizeForDistributionIndex } from '../src/helpers/calculatePrizeForDistributionIndex';

import { formatDistributionNumber } from './helpers/formatDistributionNumber';

describe('calculatePrizeForDistributionIndex()', () => {
    it('can calculate the prize awardable for the prize distribution and prize', async () => {
        // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
        // distributions[1] = 0.2e9 = prizeAtIndex
        // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) - 2 ^ (bitRangeSize ^ distributionIndex - 1)= 2 ^ (4 ^ 1) = 16 - 1 = 15
        // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e9 / 15 = 1.333e7
        // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.333e7 = 1.333e21
        // div by 1e9 = 1.33333e18

        const exampleDrawSettings: PrizeDistribution = {
            distributions: [
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

        //calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: TsunamiDrawSettings, draw: Draw)
        const prizeReceivable = calculatePrizeForDistributionIndex(1, exampleDrawSettings);
        expect(prizeReceivable).to.deep.equal(BigNumber.from('0x1280f39a34855534')); // 1.33333e18
    });
});
