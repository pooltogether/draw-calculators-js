/*
    I have a $1,000 deposit in a prize pool with $100,000,000 deposits. The total weekly prize is $75,0000. The prize is split in the following manner

    1 - $25,0000
    25 - $1,000 
    5000 - $5 prizes 

    How long does it take me to win 1 prize? 



    What are my projected total winnings over the course of 52 prizes being awarded?


*/
import { BigNumber, ethers, utils } from "ethers";
import { Draw, DrawResults, DrawSettings, DrawSimulationResult, DrawSimulationResults, User } from "../../types/types"
import { runDrawCalculatorForSingleDraw, sanityCheckDrawSettings } from "../DrawCalculator"
import {createRandomUsersSameBalance, readUsersFromFile} from "../helpers/createRandomUsers"
const debug = require('debug')('pt:tsunami-sdk-scenario1')


type UserDrawResult = {
    user: User,
    drawResult: DrawResults
}

function runScenario1(numberOfPrizePeriods: number, numberOfUsers: number, balancePerUser: BigNumber){
    // create 100,000 users with 1000 USD == 100,000,000 USD deposits
    const totalSupply = balancePerUser.mul(numberOfUsers) 
    debug("totalSupply: ", utils.formatEther(totalSupply))
    const matchCardinality = BigNumber.from(5)
    const bitRangeSize = BigNumber.from(3)

    const probabilitySpace = (BigNumber.from(2).pow(bitRangeSize)).pow(matchCardinality)
    debug("probabilitySpace: ", probabilitySpace.toString())
    const pickCost = totalSupply.div(probabilitySpace)
    console.log("pickCost: ", utils.formatEther(pickCost))

    const numberOfPicks = BigNumber.from(10) // balancePerUser.div(pickCost)
    console.log("numberOfPicks ", numberOfPicks.toString())
    
    const _picks = [...new Array<number>(numberOfPicks.toNumber()).keys()].map((num)=> BigNumber.from(num))

    const users : User[] = createRandomUsersSameBalance(numberOfUsers, balancePerUser, _picks)
     
    // const users: User[] = readUsersFromFile()
    // console.log(BigNumber.from(users[0].balance.toString()))
    // return
    
    // create weekly prize with $75,000 and randomWinningNumber (changing weekly)
    let draw : Draw = {
        prize: utils.parseEther("75000"),
        winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
    }
    
    
    const drawSettings : DrawSettings = {
        distributions: [
                        ethers.utils.parseEther("0.3333333"), // 25,000 / 75,000             
                        ethers.utils.parseEther("0.0133333"), // 1,000 / 75,000
                        ethers.utils.parseEther("0.0000666") // 5 / 75,000
                    ],
        pickCost,
        matchCardinality,
        bitRangeSize
    }
    
    let userResults = new Map() // <String, Array<UserDrawResult>> 

    /*
    [
        [{address: "blah", prizeAwardaable: ....}, ],
        [],
        [],
        ...
        ]
    */

    // run 52 times
    for(let currentPrizePeriod = 0; currentPrizePeriod < numberOfPrizePeriods; currentPrizePeriod++){
        
        draw = {
            ...draw,
            winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
        }
        console.log(`calculating for run ${currentPrizePeriod}, randomNumberThisRun: ${draw.winningRandomNumber}`)

        users.forEach(user => {
            console.log("running for user with address: ", user.address)
            const userResultThisRun : DrawResults = runDrawCalculatorForSingleDraw(drawSettings, draw, user) 
        
            // only populate with winning values
            if(userResultThisRun.totalValue.gt(BigNumber.from(0))){
                console.log(`User ${user.address} won a prize at prizePeriod ${currentPrizePeriod} of value: ${utils.formatEther(userResultThisRun.totalValue)}`)
                const userDrawResult : UserDrawResult = {
                    user,
                    drawResult: userResultThisRun
                }
                // should this be a per user hash map (address => UserResult) ???
                // OR store by prizePeriod
                // userResults[currentPrizePeriod].push(userDrawResult)
                const key = currentPrizePeriod.toString()
                console.log("key is ", key)
                let currentValues = userResults.get(key)
                if(!currentPrizePeriod){
                    currentValues = []
                }
                console.log("currentValues ", currentValues)
                // userResults[key].push(userDrawResult)
                userResults.set(key, currentValues.push(userDrawResult))
            }         
        });
    }

    return userResults

}

function run(){
    const results = runScenario1(10, 5, utils.parseEther("1000"))
    console.log(results)
    results.forEach((result, index) => {
        console.log(`prizePeriodId ${index} had ${result.length} winning addresses`)
    });

}
run()


// function runNTimes(runTimes: number){

//     let userResults: UserResult [] = []

//     for(let run = 0; run < runTimes; run++){
//         let totalUserWins = 0
//         let totalUserPrize = BigNumber.from(0)

//         const userResultThisRun = runScenario1(52, 100000, utils.parseEther("1000"))
        
//         if(userResultThisRun.totalPrizesAwardable.gt(BigNumber.from(0))){
//             totalUserWins++
//             totalUserPrize = totalUserPrize.add(userResultThisRun.totalPrizesAwardable)
//         }
//         console.log(`the user ${userResultThisRun.user.address} won ${totalUserWins} times with a totalPrizeAwardable ${utils.formatEther(totalUserPrize)}`)
//     }
    
// }
// runNTimes(10000)
