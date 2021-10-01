import { BigNumber, ethers, utils } from 'ethers';
import { expect } from 'chai';
import { Claim, Draw, DrawResults, PrizeDistribution, User } from '../src/types';
import { batchCalculateDrawResults } from '../src/batchCalculateDrawResults';
import { prepareClaims } from '../src/prepareClaims';

import { formatDistributionNumber } from './helpers/formatDistributionNumber';
import { defaultAbiCoder } from '@ethersproject/abi';

describe('prepareClaims()', () => {
    it('returns correct claim struct for user', async () => {
        const exampleDrawSettings1: PrizeDistribution = {
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

        const exampleDrawSettings2: PrizeDistribution = {
            distributions: [
                formatDistributionNumber('0.3'),
                formatDistributionNumber('0.2'),
                formatDistributionNumber('0.1'),
            ],
            numberOfPicks: BigNumber.from(10),
            matchCardinality: 3,
            bitRangeSize: 10, // set very high so matching unlikely
            prize: BigNumber.from(utils.parseEther('100')),
            maxPicksPerUser: 1000,
        };
        const drawIds = [2, 3];
        const winningPickIndices = BigNumber.from(1);

        const exampleDraw1: Draw = {
            drawId: drawIds[0],
            winningRandomNumber: BigNumber.from(
                '8781184742215173699638593792190316559257409652205547100981219837421219359728',
            ),
        };
        const exampleDraw2: Draw = {
            drawId: drawIds[1],
            winningRandomNumber: BigNumber.from(
                '8781184742215173699638593792190316559257409652205547100981219837421219359728',
            ),
        };

        const exampleUser: User = {
            address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
            normalizedBalances: [ethers.utils.parseEther('0.2'), ethers.utils.parseEther('0.2')],
        };

        const drawResults: DrawResults[] = batchCalculateDrawResults(
            [exampleDrawSettings1, exampleDrawSettings2],
            [exampleDraw1, exampleDraw2],
            exampleUser,
        );

        expect(drawResults.length).to.equal(2);

        const claimResult: Claim = prepareClaims(exampleUser, drawResults);

        expect(claimResult.drawIds).to.deep.equal([drawIds[0]]);

        const expectedData = defaultAbiCoder.encode(['uint256[][]'], [[[winningPickIndices]]]);
        expect(claimResult.data).to.deep.equal(expectedData);
    });
});
