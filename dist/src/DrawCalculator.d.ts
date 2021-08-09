import { BigNumber } from "ethers";
import { Draw, DrawSettings, User } from "../types/types";
export declare function runDrawCalculatorForSingleDraw(drawSettings: DrawSettings, draw: Draw, user: User): BigNumber;
export declare function calculatePickFraction(randomNumberThisPick: string, winningRandomNumber: BigNumber, _drawSettings: DrawSettings, draw: Draw): BigNumber;
export declare function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, indexOffset: BigNumber, bitRangeValue: BigNumber): boolean;
export declare function calculatePrizeAmount(drawSettings: DrawSettings, draw: Draw, matches: number): BigNumber;
export declare function sanityCheckDrawSettings(drawSettings: DrawSettings): string;
