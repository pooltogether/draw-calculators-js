
import { BigNumber, ethers, utils } from "ethers";
import { expect } from "chai"
import { Draw, DrawSettings, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, findBitMatchesAtIndex, calculateNumberOfMatchesForPrize, calculatePrizeAmount } from "../src/drawCalculator"

describe('DrawCalculator', () => {
    it.only('Single DrawCalculator run 2 matches', async () => {
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
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(BigInt(9818474807567937660714483746420294115396450454986178514367709522842585653685))//BigNumber.from(61676)
        }
        
        const exampleUser : User = {
            address: "0x568Ea56Dd5d8044269b1482D3ad4120a7aB0933A",
            balance: ethers.utils.parseEther("10"),
            pickIndices: [BigNumber.from(1)]
        } 
        console.time("singleRun")
        const prize = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
        
        

        console.timeEnd("singleRun")
        const prizeReceived = utils.parseEther("5")
        expect(prize).to.deep.equal(prizeReceived)
    })

    it('Can calculate the number of matches required to receive a prize', async () => {
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
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(BigInt(9818474807567937660714483746420294115396450454986178514367709522842585653685))//BigNumber.from(61676)
        }

        const prizeReceived = utils.parseEther("5")
        
        const result = calculateNumberOfMatchesForPrize(exampleDrawSettings, exampleDraw, prizeReceived)
        expect(result).to.equal(2)
    
    })

    it('Can calculate the prize given the draw settings and number of matches', async () => {
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
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(BigInt(9818474807567937660714483746420294115396450454986178514367709522842585653685))//BigNumber.from(61676)
        }
        
        const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 2)
        const prizeReceived = utils.parseEther("5")
        expect(result).to.deep.equal(prizeReceived)
    
    })


    it('Can findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(BigNumber.from(61676),
        BigNumber.from(61612),
        BigNumber.from(8),
        BigNumber.from(255))
        expect(result).to.be.true
    
    })


    it('Can findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(
        BigNumber.from(BigInt(24703804328475188150699190457572086651745971796997325887553663750514688469872)),
        BigNumber.from(BigInt(8781184742215173699638593792190316559257409652205547100981219837421219359728)),
        BigNumber.from(8),
        BigNumber.from(255))
        expect(result).to.be.true
    
    })

    // winnningRandomNumber: 8781184742215173699638593792190316559257409652205547100981219837421219359728
    // 
    it('Second single DrawCalculator run 3 matches', async () => {
        const exampleDrawSettings : DrawSettings = {
            distributions: [
                ethers.utils.parseEther("0.4"),
                ethers.utils.parseEther("0.2"),
                ethers.utils.parseEther("0.1"),
                ethers.utils.parseEther("0.1")],
            pickCost: BigNumber.from(ethers.utils.parseEther("1")),
            matchCardinality: BigNumber.from(4),
            bitRangeValue: BigNumber.from(15),
            bitRangeSize : BigNumber.from(4)
        }
        
        const exampleDraw : Draw = {
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(BigInt(8781184742215173699638593792190316559257409652205547100981219837421219359728))
        }
        
        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: ethers.utils.parseEther("10"),
            pickIndices: [BigNumber.from(1)]
        } 
        
        const prize = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
        
        const prizeReceived = utils.parseEther("5")
        expect(prize).to.deep.equal(prizeReceived)
    })

    it('Can calculate the prize given the draw settings and number of matches', async () => {
        const exampleDrawSettings : DrawSettings = {
            distributions: [
                ethers.utils.parseEther("0.4"),
                ethers.utils.parseEther("0.2"),
                ethers.utils.parseEther("0.1"),
                ethers.utils.parseEther("0.1")],
            pickCost: BigNumber.from(ethers.utils.parseEther("1")),
            matchCardinality: BigNumber.from(4),
            bitRangeValue: BigNumber.from(15),
            bitRangeSize : BigNumber.from(4)
        }
        
        const exampleDraw : Draw = {
            prize: BigNumber.from(100),
            winningRandomNumber: BigNumber.from(BigInt(8781184742215173699638593792190316559257409652205547100981219837421219359728))
        }
        
        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            balance: ethers.utils.parseEther("10"),
            pickIndices: [BigNumber.from(1)]
        } 
        
        const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 3)
        const prizeReceived = utils.parseEther("5")
        expect(result).to.deep.equal(prizeReceived)
    
    })

    
})