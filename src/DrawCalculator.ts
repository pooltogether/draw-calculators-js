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
        
        debug("winningRandomNumber: ", winningRandomNumber.toString())
        debug("randomNumberThisPick: ", BigNumber.from(randomNumberThisPick).toString())
        
        if(findBitMatchesAtIndex(BigNumber.from(randomNumberThisPick), winningRandomNumber, matchIndex, _drawSettings)){
            debug(`match at index ${matchIndex}`)
            numberOfMatches++;
        }
    }
    debug(`\n DrawCalculator:: Found ${numberOfMatches} matches..`)
    const pickAmount = calculatePrizeAmount(_drawSettings, draw, numberOfMatches)
    if(pickAmount){
        debug(`user is receviing a prize`)
        return pickAmount
    }
    // else there is no prize   
    return undefined
}

// calculates the absolute amount of Prize in Wei for the Draw and DrawSettings
export function calculatePrizeAmount(drawSettings: DrawSettings, draw: Draw, matches :number): PickPrize | undefined{ // returns the prize you would receive for drawSettings and number of matches

    const distributionIndex = drawSettings.matchCardinality.toNumber() - matches
    debug(`distributionIndex: ${distributionIndex}, : (${drawSettings.matchCardinality.toNumber()} - ${matches} )`)

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

//SOLIDITY SIG: function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue) 
export function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, matchIndex: number, _drawSettings: DrawSettings): boolean {

    const indexOffset: number = matchIndex * _drawSettings.bitRangeSize.toNumber()
    const word1DataHexString: string = word1.toHexString()
    const word2DataHexString: string = word2.toHexString()
    const bitRangeValue: string = (Math.pow(2, _drawSettings.bitRangeSize.toNumber()) - 1).toString()
    const mask : BigInt = BigInt(bitRangeValue) << BigInt(indexOffset.toString())
    const bits1 = BigInt(word1DataHexString) & BigInt(mask)
    const bits2 = BigInt(word2DataHexString) & BigInt(mask)
    debug(`DrawCalculator:: matching ${bits1.toString()} with ${bits2.toString()}`)
    return bits1 == bits2
}

export function calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: DrawSettings, draw: Draw): BigNumber {
    // totalPrize *  (distributions[index]/(range ^ index)) where index = matchCardinality - numberOfMatches
    const fractionOfPrize = calculateFractionOfPrize(prizeDistributionIndex, drawSettings)
    let expectedPrizeAmount : BigNumber = (drawSettings.prize).mul(fractionOfPrize)
    expectedPrizeAmount = expectedPrizeAmount.div(ethers.constants.WeiPerEther)

    // console.log("expectedPrizeAmount ", utils.formatEther(expectedPrizeAmount))

    return expectedPrizeAmount
}

export function calculateFractionOfPrize(prizeDistributionIndex: number, drawSettings: DrawSettings): BigNumber {
    const numberOfPrizes = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(BigNumber.from(prizeDistributionIndex))
    debug("numberOfPrizes for index ", numberOfPrizes)
    
    const valueAtDistributionIndex : BigNumber = drawSettings.distributions[prizeDistributionIndex]
    debug("valueAtDistributionIndex ", utils.formatEther(valueAtDistributionIndex.toString()))
    
    const fractionOfPrize: BigNumber= valueAtDistributionIndex.div(numberOfPrizes)
    debug("fractionOfPrize: ", utils.formatEther(fractionOfPrize))
    return fractionOfPrize
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

function getDrawSettings(){
    // returns current draw settings
}

function prepareClaimForUser(){

}
