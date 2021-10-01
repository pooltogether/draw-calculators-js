import { defaultAbiCoder } from '@ethersproject/abi';
import { BigNumber } from 'ethers';
import { sortByBigNumber } from './helpers/sortByBigNumber';
import { User, DrawResults, Claim } from './types';

// for a given User and DrawResult, prepares the input for the contract ClaimableDraw::claim() call
export function prepareClaims(user: User, drawResults: DrawResults[]): Claim {
    let claim: Claim = {
        userAddress: user.address,
        drawIds: [],
        encodedWinningPickIndices: '',
        winningPickIndices: [],
    };
    if (drawResults.length == 0) {
        return claim;
    }
    //for each draw run the runDrawCalculatorForSingleDraw, if there is a winner add to result
    drawResults.forEach((drawResult) => {
        if (drawResult.totalValue.gt(BigNumber.from(0))) {
            claim.drawIds.push(drawResult.drawId);
            // now add the pickIndices data
            let winningPicks: BigNumber[] = [];
            for (const prizeAwardable of drawResult.prizes) {
                winningPicks.push(prizeAwardable.pick);
            }
            claim.winningPickIndices.push(winningPicks);
        }
    });

    claim.winningPickIndices = claim.winningPickIndices.map((data) => data.sort(sortByBigNumber));
    claim.encodedWinningPickIndices = defaultAbiCoder.encode(
        ['uint256[][]'],
        [claim.winningPickIndices],
    );
    return claim;
}
