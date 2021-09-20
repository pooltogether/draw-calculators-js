/*
    I have a $1,000 deposit in a prize pool with $100,000,000 deposits. The total weekly prize is $75,0000. The prize is split in the following manner

    1 - $25,0000
    25 - $1,000 
    5000 - $5 prizes 

    How long does it take me to win 1 prize? 



    What are my projected total winnings over the course of 52 prizes being awarded?


*/
import { BigNumber, ethers, utils } from "ethers";
import { Draw, DrawResults, TsunamiDrawSettings, PrizeAwardable, User, UserDrawResult } from "../types"
import { runTsunamiDrawCalculatorForSingleDraw } from "../tsunamiDrawCalculator"
import {createRandomUsersSameBalance, generateAndSaveUserAddresses, getRandomInt, readAddressesFromFile, readUsersFromFile} from "./utils/createRandomUsers"
import {writeFileSync, readFileSync, mkdirSync} from "fs"
import { Map } from "immutable"
import { fork } from "child_process";

const debug = require('debug')('pt:tsunami-sdk-scenario1')

const printUtils = require("../helpers/printUtils")
const { dim, green, yellow } = printUtils


async function runDrawCalculatorEqualBalances(numberOfPrizePeriods: number, numberOfUsers: number, balancePerUser: BigNumber, drawSettings: TsunamiDrawSettings): Promise<Map<string, UserDrawResult[]>[]>{
    // create 100,000 users with 1000 USD == 100,000,000 USD deposits
    const totalSupply = balancePerUser.mul(numberOfUsers) 
    debug("totalSupply: ", utils.formatEther(totalSupply))

    // const probabilitySpace = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(drawSettings.matchCardinality)
    // debug("probabilitySpace: ", probabilitySpace.toString())
    
    const pickCost = drawSettings.pickCost//totalSupply.div(probabilitySpace)
    console.log("pickCost: ", utils.formatEther(pickCost))

    const numberOfPicksPerUser = balancePerUser.div(pickCost)
    console.log("numberOfPicksPerUser ", numberOfPicksPerUser.toString())
    
    const _picks = [...new Array<number>(numberOfPicksPerUser.toNumber()).keys()].map((num)=> BigNumber.from(num))

    const addresses: string[] = readAddressesFromFile()
    console.log(`read ${addresses.length} addresses from file..`)
    // now create Users
    const users : User[] = []
    addresses.forEach((addressEntry: any) => {
        users.push({
            address: addressEntry.address,
            balance: balancePerUser,
            pickIndices: _picks
        })
    })

    let _drawSettings : TsunamiDrawSettings = {
        ...drawSettings,
        pickCost
    }
    
    let drawResults = Map<string, Array<UserDrawResult>>() // <String, Array<UserDrawResult>> // prizePeriodId => UserDrawResult[]
    let userResults = Map<string, Array<UserDrawResult>>() // <String, Array<UserDrawResult>> // address => UserDrawResult[]

    const forkPromise = (obj: any) => {
        return new Promise((resolve, reject) => {
            const child = fork('./utils/child.js', [obj]);
            
            // has result
            child.on('message', (result) => {
                // console.log("received message from child", result)
                resolve(result)
            })
        })
    }

    let promises: any= []

    for(let currentPrizePeriod = 0; currentPrizePeriod < numberOfPrizePeriods; currentPrizePeriod++){
        
        let draw = {
            drawId: BigNumber.from(currentPrizePeriod),
            winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
        }
        // console.log(`calculating for run ${currentPrizePeriod}, randomNumberThisRun: ${draw.winningRandomNumber}`)

        // set up the promises
        promises.push(forkPromise(JSON.stringify({
            draw,
            drawSettings: _drawSettings,
            users,
            currentPrizePeriod
        })))
    }

    const resultsMaps = await Promise.all(promises)

    // now deserialize the results and merge the maps
    resultsMaps.forEach((resultMap: any) => {
        // each result is a array of Maps 
        // for currentPrizePeriod keyed can just merge (no key collisions)
        drawResults = drawResults.merge(resultMap)

        // for each user keyed, we need to merge but append the values
        userResults = userResults.mergeWith((oldVal: UserDrawResult[], newVal: UserDrawResult[], key: string) : any => {
            return oldVal.concat(newVal)
        }, resultMap)

    })

    return [drawResults, userResults]
}

async function run(){
    const matchCardinality = 6
    const bitRangeSize = 4
    const pickCost = utils.parseEther("25")

    const drawSettings: TsunamiDrawSettings = {
        matchCardinality,
        bitRangeSize,
        distributions: [
                ethers.utils.parseEther("0.3333333"), // 25,000 / 75,000  => $25000 prize           
                ethers.utils.parseEther("0.2133333"), // (1,000 / 75,000) * 16 ((2 ^ bitRangeSize) ^ distributionIndex => $1000 prize
                ethers.utils.parseEther("0.0170666") // (5 / 75,000) * 256 winners => $5 prize
        ],
        pickCost,
        prize: utils.parseEther("75000"),
    }
    console.log("running simulation...")
    const results : Map<string, UserDrawResult[]>[]  = await runDrawCalculatorEqualBalances(1, 1000, utils.parseEther("1000"), drawSettings)
    console.log("got simulation results...")
    
    parseAndSaveCSVResults(results[0], drawSettings, "overallResults")
    parseAndSaveCSVResults(results[1], drawSettings, "userResults")
}
run()



function addResultToMap(key: string, value: UserDrawResult, map :Map<string, UserDrawResult[]>){
    let currentValues : UserDrawResult[] | undefined = map.get(key)
    
    if(!currentValues){
        currentValues = new Array<UserDrawResult>()
    }
    currentValues.push(value)
    map.set(key, currentValues)
}


function parseAndSaveCSVResults(results: Map<string, UserDrawResult[]>, drawSettings: TsunamiDrawSettings, fileName: string){
    
    let saveCSVString = JSON.stringify(drawSettings) + "\n"


    results.forEach((winners, index) => {
        let csvFormatString = `${index}`

        // green(`prizePeriodId ${index} had ${winners.length} winners`)
        
        let totalPrizeAwardableForPeriod: BigNumber = BigNumber.from(0)
        let prizeDistributions : Array<number> = new Array(drawSettings.distributions.length).fill(0)

        winners.forEach((winner)=>{
            totalPrizeAwardableForPeriod = totalPrizeAwardableForPeriod.add(winner.drawResult.totalValue)

            // increment whatever prize distribution won
            winner.drawResult.prizes.forEach((prize: PrizeAwardable) => {
                prizeDistributions[prize.distributionIndex]++
            });
        })

        // breakdown
        // console.log(`Total prize awardable: ${utils.formatEther(totalPrizeAwardableForPeriod)}`)
        csvFormatString = csvFormatString.concat(`,${utils.formatEther(totalPrizeAwardableForPeriod)}`)

        prizeDistributions.forEach((numberOfPrizesAtIndex, index) => {
            // console.log(`index ${index} had ${numberOfPrizesAtIndex} winners..`)
            csvFormatString = csvFormatString.concat(`,${numberOfPrizesAtIndex}`)
        });

        saveCSVString += csvFormatString + "\n"
        
    });
    saveToFile(saveCSVString, fileName)

}

function saveToFile(csvString : string, fileName: string){
    const pathFileBase = `./simData`
    mkdirSync(pathFileBase, { recursive: true });
    writeFileSync(`${pathFileBase}/${fileName}.csv`, csvString, "utf8")
    console.log(`saved CSV to file ${fileName}`)
}

