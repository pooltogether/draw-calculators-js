import { BigNumber } from 'ethers';
import { User, DrawResults, Claim } from './types';

// for a given User and DrawResult, prepares the input for the contract ClaimableDraw::claim() call
// called with result of runTsunamiDrawCalculatorForSingleDraw()
export function prepareClaimForUserFromDrawResult(user: User, drawResult: DrawResults): Claim {
    let claim: Claim = {
        userAddress: user.address,
        drawIds: [],
        data: [],
    };

    if (drawResult.totalValue.gt(BigNumber.from(0))) {
        claim.drawIds.push(drawResult.drawId);

        // now add the pickIndices data
        let winningPicks: BigNumber[] = [];
        for (const prizeAwardable of drawResult.prizes) {
            winningPicks.push(prizeAwardable.pick);
        }
        claim.data.push(winningPicks);
    }
    return claim;
}

// multiple version of prepareClaimForUserFromDrawResult
export function prepareClaimsForUserFromDrawResults(user: User, drawResults: DrawResults[]): Claim {
    let claim: Claim = {
        userAddress: user.address,
        drawIds: [],
        data: [],
    };
    //for each draw run the runDrawCalculatorForSingleDraw, if there is a winner add to result
    for (const [, drawResult] of drawResults.entries()) {
        if (drawResult.totalValue.gt(BigNumber.from(0))) {
            claim.drawIds.push(drawResult.drawId);
            // now add the pickIndices data
            let winningPicks: BigNumber[] = [];
            for (const prizeAwardable of drawResult.prizes) {
                winningPicks.push(prizeAwardable.pick);
            }
            claim.data.push(winningPicks);
        }
    }
    return claim;
}
