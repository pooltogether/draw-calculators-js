import { DrawSettings, Draw, PickPrize } from '../types';
import { calculatePrizeForDistributionIndex } from './calculatePrizeForDistributionIndex';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

// calculates the absolute amount of Prize in Wei for the Draw and DrawSettings
export function calculatePrizeAmount(
    drawSettings: DrawSettings,
    draw: Draw,
    matches: number,
): PickPrize | undefined {
    // returns the prize you would receive for drawSettings and number of matches

    const distributionIndex = drawSettings.matchCardinality - matches;
    debug(
        `distributionIndex: ${distributionIndex}, : (${drawSettings.matchCardinality} - ${matches} )`,
    );

    if (distributionIndex < drawSettings.distributions.length) {
        // user *may* be getting a prize
        const expectedPrizeAmount = calculatePrizeForDistributionIndex(
            distributionIndex,
            drawSettings,
            draw,
        );
        return {
            amount: expectedPrizeAmount,
            distributionIndex,
        };
    }
    // user did not qualify for a prize
    return undefined;
}
