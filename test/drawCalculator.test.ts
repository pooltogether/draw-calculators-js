
import { BigNumber, ethers } from "ethers";
import { expect } from "chai"
import { Draw, DrawSettings, DrawSimulationResult, DrawSimulationResults, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, findBitMatchesAtIndex } from "../src/DrawCalculator"

describe('DrawCalculator', () => {
    it('Single DrawCalculator run', async () => {
        const exampleDrawSettings : DrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            pickCost: BigNumber.from(ethers.utils.parseEther("1")),
            matchCardinality: BigNumber.from(3),
            bitRangeValue: BigNumber.from(15),
            bitRangeSize : BigNumber.from(4)
        }
        
        const exampleDraw : Draw = {
            timestamp : 10000,
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(61676)
        }
        
        const exampleUser : User = {
            address: "0x568Ea56Dd5d8044269b1482D3ad4120a7aB0933A",
            balance: ethers.utils.parseEther("10"),
            pickIndices: [BigNumber.from(1)]
        } 
    
        const prize = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
        expect(prize.toString()).to.equal("500")
    })

    it('Can findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(BigNumber.from(61676),
        BigNumber.from(61612),
        BigNumber.from(8),
        BigNumber.from(255))
        expect(result).to.be.true
    
    })

})