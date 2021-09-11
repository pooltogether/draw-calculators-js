import {BigNumber, ethers} from "ethers"
import {sanityCheckDrawSettings} from "./sanityCheckDrawSettings"
import {DrawSettings, Draw} from "../types"

// inverse of calculatePrizeAmount()
export function calculateNumberOfMatchesForPrize(drawSettings: DrawSettings, draw: Draw, prizeReceived: BigNumber): number { // returns number of matches to receive that prize
    
    const sanityResult = sanityCheckDrawSettings(drawSettings)
    
    if(sanityResult == ""){
         
        const fractionOfPrizeReceived: BigNumber = prizeReceived.mul(ethers.constants.WeiPerEther).div(drawSettings.prize) // const expectedPrizeAmount : BigNumber = (draw.prize).mul(percentageOfPrize).div(ethers.constants.WeiPerEther)
        for(let i = 0; i < drawSettings.distributions.length; i++){

            // uint256 numberOfPrizesForIndex = (2 ** uint256(_drawSettings.bitRangeSize)) ** _prizeDistributionIndex;
            const numPrizes = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(i))
            // console.log("numPrioze" , numPrizes.toString())
            const prizeFractionAtIndex = drawSettings.distributions[i].div(numPrizes)
            
            if(fractionOfPrizeReceived.eq(prizeFractionAtIndex)){              
                return drawSettings.matchCardinality - (drawSettings.distributions.length - i - 1) //constdrawSettings.matchCardinality - distributionIndex = matches 
            }          
        } 
    }
    else{
        throw new Error(`error with drawSettings: ${sanityResult}`)
    }
    // else there is no number of matches
    return 0;
}


export function calculateTotalPrizeDistributedFromWinnerDistributionArray(prizeWinners: number[], draw: Draw, drawSettings: DrawSettings): BigNumber{
    /* given sim result array calculate amount of prize paid out

        example : prizeWinners [0,2,13,107,379] and distributions: [
                                    ethers.utils.parseEther("0.3"),
                                ethers.utils.parseEther("0.25"),
                                ethers.utils.parseEther("0.2"),
                                ethers.utils.parseEther("0.1"),
                                ethers.utils.parseEther("0.05")
                             ]
        
        return (0 * 0.3 * prize) + (2 * 0.25 * prize) + (13 * 0.2 * prize) + ...

    */
    let totalPayout : BigNumber = BigNumber.from("0")


    for(let index = 0;  index < drawSettings.distributions.length; index++){
        // console.log("index ", index)
        const numberOfPrizesAtIndex = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(index))
        
        // console.log("number of prizes at index", numberOfPrizesAtIndex)
        
        let distributionIndexFraction = drawSettings.distributions[index].div(numberOfPrizesAtIndex)
        let distributionIndexAmount = drawSettings.prize.mul(distributionIndexFraction).div(ethers.constants.WeiPerEther)

        // now compare against what was passed in
        totalPayout = totalPayout.add(BigNumber.from(prizeWinners[index]).mul(distributionIndexAmount))
    }

    return totalPayout    // note: this can be greater than the prize.value passed in!
}
