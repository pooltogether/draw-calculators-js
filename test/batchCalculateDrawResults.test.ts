import { BigNumber, ethers, utils } from 'ethers';
import { expect } from 'chai';
import { Draw, PrizeDistribution, User } from '../src/types';
import { batchCalculateDrawResults } from '../src/batchCalculateDrawResults';
import { formatDistributionNumber } from '../src/helpers/formatDistributionNumber';

describe('batchCalculateDrawResults()', () => {
    it('Single DrawCalculator run 1 matches', async () => {
        // distributionIndex = matchCardinality - numberOfMatches = 3 - 1 = 2
        // tiers[2] = 0.1e18 = prizeAtIndex
        // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) - ((2 ^ bitRangeSize) ^ distributionIndex - 1) =
        // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.1e9 / 128 = 7.8125E14
        // prizeAwardable = prize * fractionOfPrize = 100e18 * 7.8125E14 = 1.09375e22
        // div by 1e18  = 7.8125E16

        const exampleDrawSettings: PrizeDistribution = {
            tiers: [
                formatDistributionNumber('0.3'),
                formatDistributionNumber('0.2'),
                formatDistributionNumber('0.1'),
            ],
            numberOfPicks: BigNumber.from(10),
            matchCardinality: 3,
            bitRangeSize: 4,
            prize: BigNumber.from(utils.parseEther('100')),
            maxPicksPerUser: 100,
        };

        const exampleDraw: Draw = {
            drawId: 1,
            winningRandomNumber: BigNumber.from(
                '8781184742215173699638593792190316559257409652205547100981219837421219359728',
            ),
        };

        const exampleUser: User = {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            normalizedBalances: [ethers.utils.parseEther('0.2')],
        };

        const results = batchCalculateDrawResults(
            [exampleDrawSettings],
            [exampleDraw],
            exampleUser,
        );
        console.log(results);
        // const expectedPrize = utils.parseEther(7.8125);
        // expect(results[0].totalValue).to.deep.equal(expectedPrize);
    });

    it('all matches', async () => {
        const exampleUser: User = {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            normalizedBalances: [ethers.utils.parseEther('0.2')],
        };

        const winningNumber = utils.solidityKeccak256(['address'], [exampleUser.address]);
        const winningRandomNumber = utils.solidityKeccak256(
            ['bytes32', 'uint256'],
            [winningNumber, 1],
        );

        console.log('winning number ', winningRandomNumber);
        const exampleDrawSettings: PrizeDistribution = {
            tiers: [
                formatDistributionNumber('0.4'),
                formatDistributionNumber('0.2'),
                formatDistributionNumber('0.1'),
                formatDistributionNumber('0.1'),
            ],
            numberOfPicks: BigNumber.from(10),
            matchCardinality: 4,
            bitRangeSize: 4,
            prize: BigNumber.from(utils.parseEther('100')),
            maxPicksPerUser: 100,
        };

        const exampleDraw: Draw = {
            drawId: 1,
            winningRandomNumber: BigNumber.from(winningRandomNumber),
        };

        const results = batchCalculateDrawResults(
            [exampleDrawSettings],
            [exampleDraw],
            exampleUser,
        );
        const prizeReceived = utils.parseEther('40');
        expect(results[0].totalValue).to.deep.equal(prizeReceived);
    });
});
