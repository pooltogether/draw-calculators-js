import { BigNumber, ethers, utils } from "ethers";
import { Draw, DrawResults, DrawSettings, DrawSimulationResult, DrawSimulationResults, Prize, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, sanityCheckDrawSettings } from "./DrawCalculator"


const printUtils = require("./helpers/printUtils")
const { dim, green, yellow } = printUtils

const debug = require('debug')('pt:tsunami-sdk.ts')


//  runs calculate(), holds everything fixed but changes Draw.winningRandomNumber n times
function runDrawNTimesSingleUser(n: number, drawSettings: DrawSettings, draw: Draw, user: User) : DrawSimulationResult [] {
    debug(`running DrawCalculator simulation ${n} times..`)

    //record starting time
    // console.time("runSimulationNTimes")

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
    // console.time("runSimulationNTimes")

    return simResults
}

//  changes DrawSettings.matchCardinality holds everything else constant 
function runDrawSingleUserChangeMatchCardinality(){
    debug(`running simulation...`)
    

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
        debug(`trying for drawSettings.. ${JSON.stringify(drawSettingsThisRun)}`)

        
        let sanityCheckResult
        try{
            debug(`sanity checking drawSettings..`)
            sanityCheckResult = sanityCheckDrawSettings(drawSettingsThisRun)
        }
        catch(e){
            debug(`skipping for cardinality ${i}`)
            continue
        }
        if(sanityCheckResult != ""){
            debug(`Invalid drawSettings skipping..`)
            continue
        }
        simResults.results.push(runDrawNTimesSingleUser(100, drawSettingsThisRun, draw, user))

    }

    // do something with results
    console.log("simResults length: ", simResults.results.length)


}


function predictNumberOfWinnersForDraw(runs: number){

    const drawSettings : DrawSettings = {
        distributions: [ethers.utils.parseEther("0.3"),
                        ethers.utils.parseEther("0.2"),
                        ethers.utils.parseEther("0.1"),
                        ethers.utils.parseEther("0.05")
                    ],
        pickCost: BigNumber.from(ethers.utils.parseEther("1")),
        matchCardinality: BigNumber.from(6),
        bitRangeValue: BigNumber.from(15),
        bitRangeSize : BigNumber.from(4)
    }
    
    const draw : Draw = {
        prize: utils.parseEther("100"),
        winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
    }
    
    const user : User = {
        address: ethers.Wallet.createRandom().address,
        balance: ethers.utils.parseEther("10"),
        pickIndices: [BigNumber.from(1)]
    } 

    // sim results
    let numberOfWinners = 0
    let numberOfNonWinners = 0
    let totalPrizeAwardable : BigNumber = BigNumber.from("0") // amount of prizes paid out in these claims
    let prizeDistributionWinners = new Array<number>(drawSettings.distributions.length).fill(0);


    for(let userIndex = 0; userIndex < runs; userIndex++){
        const userThisRun: User = {
            ...user, 
            address: ethers.Wallet.createRandom().address
        }

        const result : DrawResults =  runDrawCalculatorForSingleDraw(drawSettings, draw, userThisRun)
        if(result.totalValue.gt(BigNumber.from("0"))){
            green(`there was a winner at address ${userThisRun.address}`)
            numberOfWinners++
            green(`adding ${utils.formatEther(result.totalValue)} to totalPrizeAwardable`)
            totalPrizeAwardable = totalPrizeAwardable.add(result.totalValue)

            // record which prize distribution index they were
            for(const prize of result.prizes){
                if(prize.distributionIndex){
                    
                    prizeDistributionWinners[prize.distributionIndex] = prizeDistributionWinners[prize.distributionIndex] + 1
                    green(`recording winner at distributionIndex ${prize.distributionIndex}. There are now ${prizeDistributionWinners[prize.distributionIndex]} winners at this index`)
                    
                }
            }
        }
        // else this address did not win -- record anyway
        else {
            numberOfNonWinners++
        }
    }

    green(`SimResult:: there were ${numberOfWinners} winners for this draw, awarding ${utils.formatEther(totalPrizeAwardable)}.. the prize was ${utils.formatEther(draw.prize)}`)
    yellow(`SimResult:: there were ${numberOfNonWinners} non-winners`)
    console.table(prizeDistributionWinners)


}

predictNumberOfWinnersForDraw(1000)