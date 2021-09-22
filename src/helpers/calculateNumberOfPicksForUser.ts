import { BigNumber, constants } from "ethers";
import { TsunamiDrawSettings } from "../types";


export function calculateNumberOfPicksForUser(drawSettings: TsunamiDrawSettings, normalizedBalance: BigNumber) : BigNumber {
    const numberOfPicksForDraw = drawSettings.numberOfPicks;
    return numberOfPicksForDraw.mul(normalizedBalance).div(constants.WeiPerEther)
}