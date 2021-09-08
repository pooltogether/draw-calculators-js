import { BigNumber, ethers, utils } from "ethers";
import {Draw, DrawResults, DrawSettings, User, PickPrize, PrizeAwardable, Claim} from "./types"
import { calculatePickFraction } from "./helpers/calculatePickFraction";
import { sanityCheckDrawSettings } from "./helpers/sanityCheckDrawSettings";

const printUtils = require("./helpers/printUtils")
const { dim, green, yellow } = printUtils

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

export function runTsunamiDrawCalculatorForSingleDraw(drawSettings: DrawSettings, draw: Draw, user: User): DrawResults {
    
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
        totalValue: ethers.constants.Zero,
        drawId: draw.drawId
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
                pick: user.pickIndices[i]
            }
            
            results.totalValue = results.totalValue.add(prizeAwardable.amount)  // prize += calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings);
            results.prizes.push(prizeAwardable)
        }
    }
    return results
}


export function runTsunamiDrawCalculatorForDraws(drawSettings: DrawSettings[], draws: Draw[], user: User): DrawResults[] {
    const results: DrawResults[] = []
    draws.forEach((draw, index) => {
        const drawResults = runTsunamiDrawCalculatorForSingleDraw(drawSettings[index], draws[index], user)
        if(drawResults.totalValue.gt(BigNumber.from(0))) {
            results.push(drawResults)
        }
    })
    return results
}