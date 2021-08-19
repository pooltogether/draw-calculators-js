import { BigNumber, ethers, utils } from "ethers";
import {Draw, DrawResults, DrawSettings, User, Prize} from "../types/types"

const printUtils = require("./helpers/printUtils")
const { dim, green, yellow } = printUtils

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

export function runDrawCalculatorForSingleDraw(drawSettings: DrawSettings, draw: Draw, user: User): DrawResults {
    
    const sanityCheckDrawSettingsResult = sanityCheckDrawSettings(drawSettings)
    
    if(sanityCheckDrawSettingsResult != ""){
        throw new Error(`DrawSettings invalid: ${sanityCheckDrawSettingsResult}`)
    }

    /* CALCULATE() */ //single winning number -> no loop required  
    const userRandomNumber = ethers.utils.solidityKeccak256(["address"], [user.address]) //  bytes32 userRandomNumber = keccak256(abi.encodePacked(user)); // hash the users address
    
    /* _CALCULATE()*/   
    const totalUserPicks = user.balance.div(drawSettings.pickCost) // uint256 totalUserPicks = balance / _drawSettings.pickCost;
    debug(`totalUserPicks ${totalUserPicks}`)

    const results: DrawResults = {
        prizes: [],
        totalValue: ethers.constants.Zero
    }
    
    const picksLength = user.pickIndices.length
    for(let i =0; i < picksLength; i++){ //for(uint256 index  = 0; index < picks.length; index++){
        
        if(user.pickIndices[i] > totalUserPicks){
            throw new Error(`User does not have this many picks!`)
        }

        const abiEncodedValue = utils.solidityPack(["bytes32","uint256"],[userRandomNumber,user.pickIndices[i]])
        const randomNumberThisPick = utils.keccak256(abiEncodedValue)
        // console.log("randomNumberThisPick", randomNumberThisPick)

        
        const prize: Prize = calculatePickFraction(randomNumberThisPick, draw.winningRandomNumber, drawSettings, draw)

        console.log(`adding ${utils.formatEther(prize.value)} to totalValue`)
        results.totalValue = results.totalValue.add(prize.value)  // prize += calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings);

        results.prizes.push(prize)
    }
    return results
}

//SOLIDITY SIG: function calculatePickFraction(uint256 randomNumberThisPick, uint256 winningRandomNumber, DrawSettings memory _drawSettings)
export function calculatePickFraction(randomNumberThisPick: string, winningRandomNumber: BigNumber, _drawSettings: DrawSettings, draw: Draw): Prize {
    
    let numberOfMatches = 0


    for(let matchIndex = 0; matchIndex < _drawSettings.matchCardinality.toNumber(); matchIndex++){     // for(uint256 matchIndex = 0; matchIndex < _matchCardinality; matchIndex++){
        const _matchIndexOffset: number = matchIndex * _drawSettings.bitRangeSize.toNumber()
        
        debug(dim("winningRandomNumber: ", winningRandomNumber.toString()))
        debug(dim("randomNumberThisPick: ", BigNumber.from(randomNumberThisPick).toString()))
        
        if(findBitMatchesAtIndex(BigNumber.from(randomNumberThisPick), winningRandomNumber, BigNumber.from(_matchIndexOffset), _drawSettings.bitRangeValue)){
            debug(green(`match at index ${matchIndex}`))
            numberOfMatches++;
        }
    }
    debug(green(`\n DrawCalculator:: Found ${numberOfMatches} matches..`))
    const prizeAmount = calculatePrizeAmount(_drawSettings, draw, numberOfMatches)
    return prizeAmount
}


//SOLIDITY SIG: function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue) 
export function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, indexOffset: BigNumber, bitRangeValue: BigNumber): boolean {

    const word1DataHexString: string = word1.toHexString()
    const word2DataHexString: string = word2.toHexString()
    const mask : BigInt = BigInt(bitRangeValue.toString()) << BigInt(indexOffset.toString())
    

    const bits1 = BigInt(word1DataHexString) & BigInt(mask)
    const bits2 = BigInt(word2DataHexString) & BigInt(mask)
    debug(yellow(`DrawCalculator:: matching ${bits1.toString()} with ${bits2.toString()}`))
    return bits1 == bits2
}


// calculates the absolute amount of Prize in Wei for the Draw and DrawSettings
export function calculatePrizeAmount(drawSettings: DrawSettings, draw: Draw, matches :number): Prize { // returns the prize you would receive for drawSettings and number of matches

    const distributionIndex = drawSettings.matchCardinality.toNumber() - matches
    console.log(`distributionIndex: ${distributionIndex}, : (${drawSettings.matchCardinality.toNumber()} - ${matches} )`)

    if(distributionIndex < drawSettings.distributions.length){
        // user *may* be getting a prize
        const expectedPrizeAmount = calculatePrizeForPrizeDistributionIndex(distributionIndex, drawSettings, draw)
        return {
            value: expectedPrizeAmount,
            distributionIndex
        }
    }
    // user did not qualify for a prize
    return {
        value: BigNumber.from("0"),
        distributionIndex
    }

}

export function calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: DrawSettings, draw: Draw): BigNumber {
    // totalPrize *  (distributions[index]/(range ^ index)) where index = matchCardinality - numberOfMatches
    const fractionOfPrize = calculateFractionOfPrize(prizeDistributionIndex, drawSettings)
    let expectedPrizeAmount : BigNumber = (draw.prize).mul(fractionOfPrize)
    expectedPrizeAmount = expectedPrizeAmount.div(ethers.constants.WeiPerEther)

    console.log("expectedPrizeAmount ", utils.formatEther(expectedPrizeAmount))

    return expectedPrizeAmount
}

export function calculateFractionOfPrize(prizeDistributionIndex: number, drawSettings: DrawSettings): BigNumber {
    const numberOfPrizes = Math.pow(drawSettings.bitRangeSize.toNumber(), prizeDistributionIndex)
    console.log("numberOfPrizes for index ", numberOfPrizes)
    
    const valueAtDistributionIndex : BigNumber = drawSettings.distributions[prizeDistributionIndex]
    console.log("valueAtDistributionIndex ", utils.formatEther(valueAtDistributionIndex.toString()))
    
    const fractionOfPrize: BigNumber= valueAtDistributionIndex.div(numberOfPrizes)
    console.log("fractionOfPrize: ", utils.formatEther(fractionOfPrize))
    return fractionOfPrize
}

// inverse of calculatePrizeAmount()
export function calculateNumberOfMatchesForPrize(drawSettings: DrawSettings, draw: Draw, prizeReceived: BigNumber): number { // returns number of matches to receive that prize
    
    const sanityResult = sanityCheckDrawSettings(drawSettings)
    
    if(sanityResult == ""){
         
        const fractionOfPrizeReceived: BigNumber = prizeReceived.mul(ethers.constants.WeiPerEther).div(draw.prize) // const expectedPrizeAmount : BigNumber = (draw.prize).mul(percentageOfPrize).div(ethers.constants.WeiPerEther)
        for(let i = 0; i < drawSettings.distributions.length; i++){
            const numPrizes = BigNumber.from(Math.pow(drawSettings.bitRangeSize.toNumber(),i))
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

export function calculatePrizeDistributedFromWinnerDistributionArray(prizeWinners: number[], prize: Prize, drawSettings: DrawSettings): BigNumber{
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
        let numberOfPrizesAtIndex: number = Math.pow(drawSettings.bitRangeSize.toNumber(), index)
        
        let distributionIndexFraction = drawSettings.distributions[index].div(numberOfPrizesAtIndex)
        let distributionIndexAmount = prize.value.mul(distributionIndexFraction).div(ethers.constants.WeiPerEther)

        // now compare against what was passed in
        totalPayout = totalPayout.add(BigNumber.from(prizeWinners[index]).mul(distributionIndexAmount))
    }

    return totalPayout    
}


// checks that the drawSettings are appropriate 
export function sanityCheckDrawSettings(drawSettings: DrawSettings) : string {

    if(!(drawSettings.matchCardinality.gte(drawSettings.distributions.length))){
        console.log("DrawCalc/matchCardinality-gt-distributions")
        return "DrawCalc/matchCardinality-gt-distributions"
    }
    else if(!(drawSettings.bitRangeValue.toNumber() == (Math.pow(2, drawSettings.bitRangeSize.toNumber())-1))){
        return "DrawCalc/bitRangeValue-incorrect"
    }
    else if(drawSettings.bitRangeSize.gte(Math.floor((256 / drawSettings.matchCardinality.toNumber())))){
        return "DrawCalc/bitRangeSize-too-large"
    }
    else if(drawSettings.pickCost.lte(0)){
        return "DrawCalc/pick-gt-0"
    }
    else{
        let sum = BigNumber.from(0)
        for(let i = 0; i < drawSettings.distributions.length; i++){
            sum = sum.add(drawSettings.distributions[i])
        }
        if(sum.gte(ethers.utils.parseEther("1"))){
            return "DrawCalc/distributions-gt-100%"
        }
    }
    return ""
} 