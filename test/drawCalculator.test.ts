import { BigNumber, ethers, utils } from 'ethers';
import { expect } from 'chai';
import { Claim, Draw, DrawResults, DrawSettings, User } from '../src/types';
import {
    runTsunamiDrawCalculatorForDraws,
    runTsunamiDrawCalculatorForSingleDraw,
} from '../src/tsunamiDrawCalculator';
import {
    prepareClaimForUserFromDrawResult,
    prepareClaimsForUserFromDrawResults,
} from '../src/prepareClaims';

import { calculateFractionOfPrize } from '../src/helpers/calculateFractionOfPrize';
import { calculatePrizeAmount } from '../src/helpers/calculatePrizeAmount';
import { findBitMatchesAtIndex } from '../src/helpers/findBitMatchesAtIndex';
import { calculatePrizeForDistributionIndex } from '../src/helpers/calculatePrizeForDistributionIndex';

const toDistribution = (val: string) => ethers.utils.parseUnits(val, 10).toNumber();

describe('drawCalculator', () => {
    describe('runDrawCalculatorForSingleDraw()', () => {
        it('Single DrawCalculator run 2 matches', async () => {
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18

            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: ethers.utils.parseEther('1'),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(10),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const exampleDraw: Draw = {
                drawId: 1,
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            const exampleUser: User = {
                address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                balance: ethers.utils.parseEther('10'),
                pickIndices: [BigNumber.from(1)],
            };
            // console.time("singleRun")
            const results = runTsunamiDrawCalculatorForSingleDraw(
                exampleDrawSettings,
                exampleDraw,
                exampleUser,
            );

            // console.timeEnd("singleRun")
            const prizeReceived = utils.parseEther('1.25');
            expect(results.totalValue).to.deep.equal(prizeReceived);
        });

        it('Second single DrawCalculator run 3 matches', async () => {
            // distributionIndex = matchCardinality - numberOfMatches = 4 - 3 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18
            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.4'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: BigNumber.from(ethers.utils.parseEther('1')),
                matchCardinality: 4,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const exampleDraw: Draw = {
                drawId: 1,
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            const exampleUser: User = {
                address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                balance: ethers.utils.parseEther('10'),
                pickIndices: [BigNumber.from(1)],
            };

            const results = runTsunamiDrawCalculatorForSingleDraw(
                exampleDrawSettings,
                exampleDraw,
                exampleUser,
            );

            const prizeReceived = utils.parseEther('1.25');
            expect(results.totalValue).to.deep.equal(prizeReceived);
        });
    });

    describe('calculatePrizeAmount()', () => {
        it('Can calculate the prize given the draw settings and number of matches', async () => {
            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: BigNumber.from(ethers.utils.parseEther('1')),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const exampleDraw: Draw = {
                drawId: 1,
                winningRandomNumber: BigNumber.from(
                    '9818474807567937660714483746420294115396450454986178514367709522842585653685',
                ),
                timestamp: 0,
            };

            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 2);
            const prizeReceived = utils.parseEther('1.25');
            expect(result!.amount).to.deep.equal(prizeReceived);
            expect(result!.distributionIndex).to.deep.equal(1);
        });
        it('Can calculate the prize given the draw settings and number of matches', async () => {
            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.4'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: BigNumber.from(ethers.utils.parseEther('1')),
                matchCardinality: 4,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const exampleDraw: Draw = {
                drawId: 1,
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 3);
            const prizeReceived = utils.parseEther('1.25');
            expect(result!.amount).to.deep.equal(prizeReceived);
        });
    });

    describe('findBitMatchesAtIndex()', () => {
        it('Can findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(
                BigNumber.from(61676),
                BigNumber.from(61612),
                1,
                8,
            );
            expect(result).to.be.true;
        });

        it('Can NOT findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(
                BigNumber.from(61676),
                BigNumber.from(61612),
                1,
                6,
            );
            expect(result).to.be.false;
        });

        it('Can findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(
                BigNumber.from(
                    '24703804328475188150699190457572086651745971796997325887553663750514688469872',
                ),
                BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                1,
                8,
            );
            expect(result).to.be.true;
        });

        it('Can NOT findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(
                BigNumber.from(
                    '24703804328475188150699190457572086651745971796997325887553663750514688469872',
                ),
                BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                2,
                8,
            );
            expect(result).to.be.false;
        });
    });

    describe('calculatePrizeForPrizeDistributionIndex()', () => {
        it('can calculate the prize awardable for the prize distribution and prize', async () => {
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18

            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: BigNumber.from(ethers.utils.parseEther('1')),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };
            const exampleDraw: Draw = {
                drawId: 1,
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            //calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: DrawSettings, draw: Draw)
            const prizeReceivable = calculatePrizeForDistributionIndex(
                1,
                exampleDrawSettings,
                exampleDraw,
            );
            const prize = utils.parseEther('1.25');
            expect(prizeReceivable).to.deep.equal(prize);
        });
    });

    describe('calculateFractionOfPrize()', () => {
        it('can calculate the fraction for the prize distribution', async () => {
            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: BigNumber.from(ethers.utils.parseEther('1')),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = bitRangeSize ^ distirbutionIndex = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16

            const fraction = calculateFractionOfPrize(1, exampleDrawSettings);
            const expectedFraction = utils.parseEther('0.0125');
            expect(fraction).to.deep.equal(expectedFraction);
        });
    });

    describe('prepareClaimForUserFromDrawResult()', () => {
        it('returns correct claim struct for user', async () => {
            const exampleDrawSettings: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: ethers.utils.parseEther('1'),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const drawId = 2;
            const winningPickIndices = BigNumber.from(1);

            const exampleDraw: Draw = {
                drawId,
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            const exampleUser: User = {
                address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                balance: ethers.utils.parseEther('10'),
                pickIndices: [BigNumber.from(0), winningPickIndices], // pickIndices[0] should be stripped out as it is non-winning
            };

            const drawResult = runTsunamiDrawCalculatorForSingleDraw(
                exampleDrawSettings,
                exampleDraw,
                exampleUser,
            );

            const claimResult: Claim = prepareClaimForUserFromDrawResult(exampleUser, drawResult);
            expect(claimResult.drawIds).to.deep.equal([drawId]);
            expect(claimResult.data).to.deep.equal([[winningPickIndices]]);
        });
    });

    describe('prepareClaimsForUserFromDrawResults()', () => {
        it('returns correct claim struct for user', async () => {
            const exampleDrawSettings1: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: ethers.utils.parseEther('1'),
                matchCardinality: 3,
                bitRangeSize: 4,
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const exampleDrawSettings2: DrawSettings = {
                distributions: [
                    toDistribution('0.3'),
                    toDistribution('0.2'),
                    toDistribution('0.1'),
                ],
                numberOfPicks: ethers.utils.parseEther('1'),
                matchCardinality: 3,
                bitRangeSize: 10, // set very high so matching unlikely
                prize: BigNumber.from(utils.parseEther('100')),
                pickCost: BigNumber.from(1),
                maxPicksPerUser: 100000,
                drawStartTimestampOffset: 0,
                drawEndTimestampOffset: 0,
            };

            const drawIds = [2, 3];
            const winningPickIndices = BigNumber.from(1);

            const exampleDraw1: Draw = {
                drawId: drawIds[0],
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };
            const exampleDraw2: Draw = {
                drawId: drawIds[1],
                winningRandomNumber: BigNumber.from(
                    '8781184742215173699638593792190316559257409652205547100981219837421219359728',
                ),
                timestamp: 0,
            };

            const exampleUser: User = {
                address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
                balance: ethers.utils.parseEther('10'),
                pickIndices: [BigNumber.from(0), winningPickIndices], // pickIndices[0] should be stripped out as it is non-winning
            };

            const drawResults: DrawResults[] = runTsunamiDrawCalculatorForDraws(
                [exampleDrawSettings1, exampleDrawSettings2],
                [exampleDraw1, exampleDraw2],
                exampleUser,
            );

            expect(drawResults.length).to.equal(1); // only wins exampleDraw1

            const claimResult: Claim = prepareClaimsForUserFromDrawResults(
                exampleUser,
                drawResults,
            );

            expect(claimResult.drawIds).to.deep.equal([drawIds[0]]);
            expect(claimResult.data).to.deep.equal([[winningPickIndices]]);
        });
    });
});
