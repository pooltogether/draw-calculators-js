/*
    I have a $1,000 deposit in a prize pool with $100,000,000 deposits. The total weekly prize is $75,0000. The prize is split in the following manner

    1 - $25,0000
    25 - $1,000 
    5000 - $5 prizes 

    How long does it take me to win 1 prize? 



    What are my projected total winnings over the course of 52 prizes being awarded?


*/
import { BigNumber, ethers, utils } from "ethers";
import { Draw, DrawResults, DrawSettings, PrizeAwardable, User, UserDrawResult } from "../../types/types"
import { runDrawCalculatorForSingleDraw, sanityCheckDrawSettings } from "../DrawCalculator"
import {createRandomUsersSameBalance, generateAndSaveUserAddresses, getRandomInt, readAddressesFromFile, readUsersFromFile} from "./utils/createRandomUsers"
const debug = require('debug')('pt:tsunami-sdk-scenario1')

const printUtils = require("../helpers/printUtils")
const { dim, green, yellow } = printUtils


function runDrawCalculatorEqualBalances(numberOfPrizePeriods: number, numberOfUsers: number, balancePerUser: BigNumber, drawSettings: DrawSettings): Map<string, UserDrawResult[]>[]{
    // create 100,000 users with 1000 USD == 100,000,000 USD deposits
    const totalSupply = balancePerUser.mul(numberOfUsers) 
    debug("totalSupply: ", utils.formatEther(totalSupply))


    const probabilitySpace = (BigNumber.from(2).pow(drawSettings.bitRangeSize)).pow(drawSettings.matchCardinality)
    debug("probabilitySpace: ", probabilitySpace.toString())
    
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

    
    // create weekly prize with $75,000 and randomWinningNumber (changing weekly)
    let draw : Draw = {
        prize: utils.parseEther("75000"),
        winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address])) //initial random number
    }
    
    
    let _drawSettings : DrawSettings = {
        ...drawSettings,
        pickCost
    }
    
    let drawResults = new Map() // <String, Array<UserDrawResult>> // prizePeriodId => UserDrawResult[]
    let userResults = new Map() // <String, Array<UserDrawResult>> // address => UserDrawResult[]

    for(let currentPrizePeriod = 0; currentPrizePeriod < numberOfPrizePeriods; currentPrizePeriod++){
        
        draw = {
            ...draw,
            winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
        }
        console.log(`calculating for run ${currentPrizePeriod}, randomNumberThisRun: ${draw.winningRandomNumber}`)

        // could do the following bit in parallel -- create runPrizePeriod(prizePeriodId, winningRandomNumber, users)

        users.forEach(user => {
            // console.log("running for user with address: ", user.address)
            const userResultThisRun : DrawResults = runDrawCalculatorForSingleDraw(_drawSettings, draw, user) 
        
            // only populate with winning values
            if(userResultThisRun.totalValue.gt(BigNumber.from(0))){
                
                const userDrawResult : UserDrawResult = {
                    user,
                    drawResult: userResultThisRun
                }
                
                // record into draw mapping
                // console.log(`User ${user.address} won a prize at prizePeriod ${currentPrizePeriod} of value: ${utils.formatEther(userResultThisRun.totalValue)}`)

                // add to overall results map
                addUserDrawResultToMap(currentPrizePeriod.toString(), userDrawResult, drawResults)

                // record into user-keyed mapping
                addUserDrawResultToMap(user.address, userDrawResult, userResults)

            }         
        });
    }

    return [drawResults, userResults]
}

function run(){
    const matchCardinality = BigNumber.from(5)
    const bitRangeSize = BigNumber.from(4)
    const pickCost = utils.parseEther("300")

    const drawSettings: DrawSettings = {
        matchCardinality,
        bitRangeSize,
        distributions: [
                ethers.utils.parseEther("0.3333333"), // 25,000 / 75,000             
                ethers.utils.parseEther("0.1066664"), // (1,000 / 75,000) * 8 ((2 ^ bitRangeSize) ^ distributionIndex
                ethers.utils.parseEther("0.0042666") // 5 / 75,000 * 64 winners 
        ],
        pickCost
    }

    const overallResults : Map<string, UserDrawResult[]>[]  = runDrawCalculatorEqualBalances(52, 100000, utils.parseEther("1000"), drawSettings)
    // parseAndPrintResults(overallResults)
    parseAndPrintCSVResults(overallResults[0])
    console.log("-----now printing user results----")
    parseAndPrintCSVResults(overallResults[1])
}
run()

function createAddresses(){
    console.log("generating addresses..")
    generateAndSaveUserAddresses(100000)
    console.log("done generating addresses")
}
// createAddresses()


function addUserDrawResultToMap(key: string, value: UserDrawResult, map :Map<string, UserDrawResult[]>){
    // add to overall results map
    let currentValues : UserDrawResult[] | undefined = map.get(key)
    
    if(!currentValues){
        currentValues = new Array<UserDrawResult>()
    }
    currentValues.push(value)
    map.set(key, currentValues)
}


function parseAndPrintCSVResults(results: Map<string, UserDrawResult[]>){
    
    console.log("-----printing csv values -------")
    
    results.forEach((winners, index) => {
        let csvFormatString = `${index}`

        // green(`prizePeriodId ${index} had ${winners.length} winners`)
        
        let totalPrizeAwardableForPeriod: BigNumber = BigNumber.from(0)
        let prizeDistributions : Array<number> = new Array(3).fill(0) // of length prize distributions

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

        // console.log(`\n`)
        
        console.log(csvFormatString)

    });
}