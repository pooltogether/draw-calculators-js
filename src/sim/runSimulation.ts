import { BigNumber, ethers, utils } from "ethers";
import { Draw, DrawResults, DrawSettings, DrawSimulationResult, DrawSimulationResults, User } from "../../types/types"
import { runDrawCalculatorForSingleDraw, sanityCheckDrawSettings } from "../drawCalculator"


const printUtils = require("../helpers/printUtils")
const { dim, green, yellow } = printUtils

const debug = require('debug')('pt:tsunami-sdk.ts')

function predictNumberOfWinnersForDraw(numberofUsers: number){
    const balancePerUser = BigNumber.from(utils.parseEther("100"))
    const totalSupply = BigNumber.from(numberofUsers).mul(balancePerUser)
    
    const matchCardinality = BigNumber.from(5)

    const probabilitySpace = BigNumber.from("8").pow(matchCardinality) // fixed for bitRangeSize = 3
    const pickCost = totalSupply.div(probabilitySpace)

    const drawSettings : DrawSettings = {
        distributions: [
                        ethers.utils.parseEther("0.3"),             
                        ethers.utils.parseEther("0.2"),
                        ethers.utils.parseEther("0.1"),
                        ethers.utils.parseEther("0.05")
                    ],
        pickCost,
        matchCardinality,
        bitRangeSize : BigNumber.from(3)
    }
    
    const draw : Draw = {
        prize: utils.parseEther("100"),
        winningRandomNumber: BigNumber.from(ethers.utils.solidityKeccak256(["address"], [(ethers.Wallet.createRandom()).address]))
    }
  
    const numberOfPicks = balancePerUser.div(pickCost)
    
    const _picks = [...new Array<number>(numberOfPicks.toNumber()).keys()].map((num)=> BigNumber.from(num))
    console.log(_picks.length)
    console.log("pickCost ", pickCost.toString())
    

    const user : User = {
        address: ethers.Wallet.createRandom().address,
        balance: balancePerUser,
        pickIndices: _picks 
    } 

    // sim results
    let numberOfWinners = 0
    let numberOfNonWinners = 0
    let totalPrizeAwardable : BigNumber = BigNumber.from("0") // amount of prizes paid out in these claims
    let prizeDistributionWinners = new Array<number>(drawSettings.distributions.length).fill(0);

    // create array of wallets up to param size

    // make runDrawCalculatorForSingleDraw() 

    for(let userIndex = 0; userIndex < numberofUsers; userIndex++){
        
        // change the user address per run
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
                    
                    prizeDistributionWinners[prize.distributionIndex] = prizeDistributionWinners[prize.distributionIndex] + 1 //increment 
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

predictNumberOfWinnersForDraw(5)