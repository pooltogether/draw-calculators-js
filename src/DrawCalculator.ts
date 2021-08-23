import { BigNumber, ethers, utils } from "ethers";
import {Draw, DrawResults, DrawSettings, User, PickPrize, PrizeAwardable} from "../types/types"

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
        
        if(user.pickIndices[i].gt(totalUserPicks)){
            throw new Error(`User does not have this many picks! ${user.pickIndices[i]} totalUserPicks ${totalUserPicks} ${user.pickIndices[i] > totalUserPicks}`)
        }

        const abiEncodedValue = utils.solidityPack(["bytes32","uint256"],[userRandomNumber,user.pickIndices[i]])
        const randomNumberThisPick = utils.keccak256(abiEncodedValue)
        // console.log("randomNumberThisPick", randomNumberThisPick)

        const pickPrize = calculatePickFraction(randomNumberThisPick, draw.winningRandomNumber, drawSettings, draw)
        if(pickPrize){
            const prizeAwardable : PrizeAwardable = {
                ...pickPrize,
                pick: BigNumber.from(i) 
            }
            
            results.totalValue = results.totalValue.add(prizeAwardable.amount)  // prize += calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings);
            results.prizes.push(prizeAwardable)
        }
    }
    return results
}

//SOLIDITY SIG: function calculatePickFraction(uint256 randomNumberThisPick, uint256 winningRandomNumber, DrawSettings memory _drawSettings)
export function calculatePickFraction(randomNumberThisPick: string, winningRandomNumber: BigNumber, _drawSettings: DrawSettings, draw: Draw): PickPrize | undefined {
    
    let numberOfMatches = 0

    for(let matchIndex = 0; matchIndex < _drawSettings.matchCardinality.toNumber(); matchIndex++){     // for(uint256 matchIndex = 0; matchIndex < _matchCardinality; matchIndex++){
        // const _matchIndexOffset: number = matchIndex * _drawSettings.bitRangeSize.toNumber()
        
        debug(dim("winningRandomNumber: ", winningRandomNumber.toString()))
        debug(dim("randomNumberThisPick: ", BigNumber.from(randomNumberThisPick).toString()))
        
        if(findBitMatchesAtIndex(BigNumber.from(randomNumberThisPick), winningRandomNumber, matchIndex, _drawSettings)){
            debug(green(`match at index ${matchIndex}`))
            numberOfMatches++;
        }
    }
    debug(`\n DrawCalculator:: Found ${numberOfMatches} matches..`)
    const pickAmount = calculatePrizeAmount(_drawSettings, draw, numberOfMatches)
    if(pickAmount){
        return pickAmount
    }
    // else there is no prize   
    return undefined
}

// calculates the absolute amount of Prize in Wei for the Draw and DrawSettings
export function calculatePrizeAmount(drawSettings: DrawSettings, draw: Draw, matches :number): PickPrize | undefined{ // returns the prize you would receive for drawSettings and number of matches

    const distributionIndex = drawSettings.matchCardinality.toNumber() - matches
    console.log(`distributionIndex: ${distributionIndex}, : (${drawSettings.matchCardinality.toNumber()} - ${matches} )`)

    if(distributionIndex < drawSettings.distributions.length){
        // user *may* be getting a prize
        const expectedPrizeAmount = calculatePrizeForPrizeDistributionIndex(distributionIndex, drawSettings, draw)
        return {
            amount: expectedPrizeAmount,
            distributionIndex
        } 
    }
    // user did not qualify for a prize
    return undefined
}

function getDrawSettings(){
    // returns current draw settings
}

function prepareClaimForUser(){

}


//SOLIDITY SIG: function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue) 
export function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, matchIndex: number, _drawSettings: DrawSettings): boolean {

    const indexOffset: number = matchIndex * _drawSettings.bitRangeSize.toNumber()

    const word1DataHexString: string = word1.toHexString()
    const word2DataHexString: string = word2.toHexString()
    const bitRangeValue: string = (Math.pow(2, _drawSettings.bitRangeSize.toNumber()) - 1).toString()

    const mask : BigInt = BigInt(bitRangeValue) << BigInt(indexOffset.toString())
    

    const bits1 = BigInt(word1DataHexString) & BigInt(mask)
    const bits2 = BigInt(word2DataHexString) & BigInt(mask)
    debug(yellow(`DrawCalculator:: matching ${bits1.toString()} with ${bits2.toString()}`))
    return bits1 == bits2
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
    const numberOfPrizes = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(prizeDistributionIndex))
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

            // uint256 numberOfPrizesForIndex = (2 ** uint256(_drawSettings.bitRangeSize)) ** _prizeDistributionIndex;
            const numPrizes = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(i))
            console.log("numPrioze" , numPrizes.toString())
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

export function calculatePrizeDistributedFromWinnerDistributionArray(prizeWinners: number[], draw: Draw, drawSettings: DrawSettings): BigNumber{
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
        console.log("index ", index)
        const numberOfPrizesAtIndex = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(index))
        
        console.log("number of prizes at index", numberOfPrizesAtIndex)
        
        let distributionIndexFraction = drawSettings.distributions[index].div(numberOfPrizesAtIndex)
        let distributionIndexAmount = draw.prize.mul(distributionIndexFraction).div(ethers.constants.WeiPerEther)

        // now compare against what was passed in
        totalPayout = totalPayout.add(BigNumber.from(prizeWinners[index]).mul(distributionIndexAmount))
    }

    return totalPayout    // note: this can be greater than the prize.value passed in!
}


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
        bitRangeSize : resultingBitRangeSize
    }
    // call sanityCheckDrawSettings here again?

    return drawSettings
}



// checks that the drawSettings are appropriate 
export function sanityCheckDrawSettings(drawSettings: DrawSettings) : string {

    if(!(drawSettings.matchCardinality.gte(drawSettings.distributions.length))){
        console.log("DrawCalc/matchCardinality-gt-distributions")
        return "DrawCalc/matchCardinality-gt-distributions"
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
    return "" // no error -> sane settings
} 