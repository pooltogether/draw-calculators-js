import { BigNumber, constants } from "ethers";
import { TsunamiDrawSettings } from "../types";


export function calculateNumberOfPicksForUser(drawSettings: TsunamiDrawSettings, normalizedBalance: BigNumber) : number {
    const numberOfPicksForDraw = BigNumber.from(drawSettings.numberOfPicks);
    return (numberOfPicksForDraw.mul(normalizedBalance).div(constants.WeiPerEther)).toNumber()
}