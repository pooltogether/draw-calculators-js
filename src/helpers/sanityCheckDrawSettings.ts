import { BigNumber, ethers } from "ethers"
import { DrawSettings } from "../types"

// checks that the drawSettings are appropriate 
export function sanityCheckDrawSettings(drawSettings: DrawSettings) : string {

    if(!(drawSettings.matchCardinality >= drawSettings.distributions.length)){
        console.log("DrawCalc/matchCardinality-gt-distributions")
        return "DrawCalc/matchCardinality-gt-distributions"
    }
    else if(drawSettings.bitRangeSize >= Math.floor((256 / drawSettings.matchCardinality))){
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