import { BigNumber } from 'ethers';
import { Draw, DrawResults, DrawSettings, User, Pick } from './types';
import { sanityCheckDrawSettings } from './helpers/sanityCheckDrawSettings';
import { computePicks } from './computePicks';
import { computeDrawResults } from './computeDrawResults';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

// main entry point for tsunami draw calculations
export function runTsunamiDrawCalculatorForSingleDraw(
    drawSettings: DrawSettings,
    draw: Draw,
    user: User,
): DrawResults {
    const sanityCheckDrawSettingsResult = sanityCheckDrawSettings(drawSettings);
    if (sanityCheckDrawSettingsResult != '') {
        throw new Error(`DrawSettings invalid: ${sanityCheckDrawSettingsResult}`);
    }
    const totalUserPicks = user.balance.div(drawSettings.pickCost); // uint256 totalUserPicks = balance / _drawSettings.pickCost;

    debug(`totalUserPicks ${totalUserPicks}`);
    user.pickIndices.find((value) => {
        if (value >= totalUserPicks) {
            throw new Error(
                `User does not have this many picks! ${value} totalUserPicks ${totalUserPicks} ${
                    value >= totalUserPicks
                }`,
            );
        }
    });
    const picks: Pick[] = computePicks(user.address, user.pickIndices);
    const results = computeDrawResults(drawSettings, draw, picks);
    return results;
}

// multiple version of runTsunamiDrawCalculatorForSingleDraw
export function runTsunamiDrawCalculatorForDraws(
    drawSettings: DrawSettings[],
    draws: Draw[],
    user: User,
): DrawResults[] {
    const results: DrawResults[] = [];
    draws.forEach((draw, index) => {
        const drawResults = runTsunamiDrawCalculatorForSingleDraw(
            drawSettings[index],
            draws[index],
            user,
        );
        if (drawResults.totalValue.gt(BigNumber.from(0))) {
            results.push(drawResults);
        }
    });
    return results;
}
