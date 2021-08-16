import { BigNumber, ethers } from "ethers";
import { Draw, DrawResults, DrawSettings, DrawSimulationResult, DrawSimulationResults, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, sanityCheckDrawSettings } from "./drawCalculator"


const printUtils = require("./helpers/printUtils")
const { dim, green, yellow } = printUtils


//  runs calculate(), holds everything fixed but changes Draw.winningRandomNumber n times
function runDrawNTimesSingleUser(n: number, drawSettings: DrawSettings, draw: Draw, user: User) : DrawSimulationResult [] {
    console.log(`running DrawCalculator simulation ${n} times..`)

    //record starting time
    console.time("runSimulationNTimes")

    // how can we make the following concurrent? child.spawn() for each iteration - is there a better way to do this in modern node js?

    let simResults: DrawSimulationResult [] = []

    for(let i = 0; i < n; i++){
        // change random number
        const newWinningRandomNumberAddress = (ethers.Wallet.createRandom()).address 
        const hashOfNewWinningRandonNumber : string = ethers.utils.solidityKeccak256(["address"], [newWinningRandomNumberAddress])
        const newWinningRandomNumber = BigNumber.from(hashOfNewWinningRandonNumber)
        
        let runDraw : Draw = {
            ...draw,
            winningRandomNumber: newWinningRandomNumber
        }   
        
        const results : DrawResults = runDrawCalculatorForSingleDraw(drawSettings, runDraw, user)

        simResults.push({
            draw: runDraw,
            user,
            drawSettings,
            results
        })
    }
    //record finishing time
    console.time("runSimulationNTimes")

    return simResults
}

//  changes DrawSettings.matchCardinality holds everything else constant 
function runDrawSingleUserChangeMatchCardinality(){
    dim(`running simulation...`)
    const RUN_TIME = 100

    const drawSettings : DrawSettings = {
        distributions: [ethers.utils.parseEther("0.3"),
                        ethers.utils.parseEther("0.2"),
                        ethers.utils.parseEther("0.1")],
        pickCost: BigNumber.from(ethers.utils.parseEther("1")),
        matchCardinality: BigNumber.from(1),
        bitRangeValue: BigNumber.from(15),
        bitRangeSize : BigNumber.from(4)
    }

    const draw : Draw = {
        prize: BigNumber.from(100),
        winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
    }
    
    const user : User = {
        address: "0x568Ea56Dd5d8044269b1482D3ad4120a7aB0933A",
        balance: ethers.utils.parseEther("10"),
        pickIndices: [BigNumber.from(1)]
    } 

    let simResults : DrawSimulationResults = { results: [] }

    // drawSettings matchCardinality must satisfy sanityCheckDrawSettings

    // matchCardinality is uint16 (65,536) possibilities
    for(let i = 0; i < 65536; i++){
        
        const drawSettingsThisRun :DrawSettings= {
            ...drawSettings,
            matchCardinality: BigNumber.from(i)
        }
        if(sanityCheckDrawSettings(drawSettingsThisRun)!= ""){
            // this settings cannot be set, skipping
            dim(`skipping for cardinality ${i}`)
            continue
        }

        simResults.results.push(runDrawNTimesSingleUser(100, drawSettingsThisRun, draw, user))

    }

    // do something with results

}


runDrawSingleUserChangeMatchCardinality()