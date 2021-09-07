import {BigNumber, ethers} from "ethers"
import {sanityCheckDrawSettings} from "../drawCalculator"
import {DrawSettings, Draw} from "../../types/types"

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
                return drawSettings.matchCardinality.toNumber() - (drawSettings.distributions.length - i - 1) //constdrawSettings.matchCardinality.toNumber() - distributionIndex = matches 
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

// TODO: WIP
function calculateDrawSettingsForPrizeDistribution(prizeDistributions: BigNumber[]) : DrawSettings {
    /*
        matching loop runs matchCardinality times. 
        // Note: it would be more gas efficient to increase the bitRangeSize before increasing the matchCardinality (as the matching loop would run less)

        The probability of 1 pick matching 1 number across the matchCardinality = (1 / (2 ^ bitRangeSize) - 1) * matchCardinality

        e.x: 
            bitRangeSize = 4, matchCardinality = 5, -> (1 / 2 ^ 4 -1) * 5 = 0.3333
            bitRangeSize = 8, matchCardinality = 5, -> (1 / 2 ^ 8 -1) * 5 = 0.0196
            

        The probability of 1 pick matching ALL numbers across the matchCardinality  = ((1 / (2 ^ bitRangeSize) - 1) * matchCardinality) ^ matchCardinality

        e.x.:
            bitRangeSize = 4, matchCardinality = 5, -> (1 / 2 ^ 4 -1) * 5 = (0.3333 ^ 5) = 4.115e-3
            bitRangeSize = 8, matchCardinality = 5, -> (1 / 2 ^ 8 -1) * 5 = 0.0196 = 2.8925e-9

        // set a sample prize distribution [0.3, 0.2, 0.1, 0.05] and prize 100 Eth

        what bitRangeSize and matchCardinality do we set so that all the full prize amount is consumed?

        // correct to say that all probabilities across each distribution added together == 1 will give correct payout??

        // 
        
    */

    let resultingMatchCardinality: BigNumber = BigNumber.from("0")
    let resultingBitRangeSize: BigNumber = BigNumber.from("0")
    
    // now calculate values for matchCardinality and bitRangeSize


    const drawSettings : DrawSettings = {
        distributions: prizeDistributions,
        pickCost: BigNumber.from(ethers.utils.parseEther("1")),
        matchCardinality: resultingMatchCardinality,
        bitRangeSize : resultingBitRangeSize,
        prize: ethers.utils.parseEther("100")
    }
    // call sanityCheckDrawSettings here again?

    return drawSettings
}