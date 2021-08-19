
import { BigNumber, ethers, utils } from "ethers";
import { expect } from "chai"
import { Draw, DrawSettings, Prize, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, findBitMatchesAtIndex, calculateNumberOfMatchesForPrize, calculatePrizeAmount, calculatePrizeForPrizeDistributionIndex, calculateFractionOfPrize, calculatePrizeDistributedFromWinnerDistributionArray } from "../src/DrawCalculator"

describe('drawCalculator', () => {
    describe('runDrawCalculatorForSingleDraw()', () => {
        
        it('Single DrawCalculator run 2 matches', async () => {
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = bitRangeSize ^ distirbutionIndex = 4 ^ 1 = 4
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 4 = 0.05e18
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 0.05e18 = 5e36
            // div by 1e18 = 5e18
            
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
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            const exampleUser : User = {
                address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                balance: ethers.utils.parseEther("10"),
                pickIndices: [BigNumber.from(1)]
            } 
            // console.time("singleRun")
            const results = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
        
            // console.timeEnd("singleRun")
            const prizeReceived = BigNumber.from("5")
            expect(results.totalValue).to.deep.equal(prizeReceived)
        })
    
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
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            const exampleUser : User = {
                address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                balance: ethers.utils.parseEther("10"),
                pickIndices: [BigNumber.from(1)]
            } 
            
            const results = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
            
            const prizeReceived = BigNumber.from("5")
            expect(results.totalValue).to.deep.equal(prizeReceived)
        })
    })

    describe('calculatePrizeAmount()', () => {
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
                winningRandomNumber: BigNumber.from("9818474807567937660714483746420294115396450454986178514367709522842585653685")
            }
            
            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 2)
            const prizeReceived = BigNumber.from("5")
            expect(result.value).to.deep.equal(prizeReceived)
            expect(result.distributionIndex).to.deep.equal(1)
        
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
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 3)
            const prizeReceived = BigNumber.from("5")
            expect(result.value).to.deep.equal(prizeReceived)  
        })
    })

    describe('calculateNumberOfMatchesForPrize()', () => {
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
                winningRandomNumber: BigNumber.from("9818474807567937660714483746420294115396450454986178514367709522842585653685")
            }
    
            const prizeReceived = BigNumber.from("5")
            
            const result = calculateNumberOfMatchesForPrize(exampleDrawSettings, exampleDraw, prizeReceived)
            expect(result).to.equal(2)
        
        })
    })

    describe('findBitMatchesAtIndex()', () => {
        it('Can findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(BigNumber.from(61676),
            BigNumber.from(61612),
            BigNumber.from(8),
            BigNumber.from(255))
            expect(result).to.be.true
        
        })

        it('Can NOT findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(BigNumber.from(61676),
            BigNumber.from(61612),
            BigNumber.from(6),
            BigNumber.from(63))
            expect(result).to.be.false
        
        })    
        
        it('Can findBitMatchesAtIndex', async () => {
            const result = findBitMatchesAtIndex(
            BigNumber.from("24703804328475188150699190457572086651745971796997325887553663750514688469872"),
            BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728"),
            BigNumber.from(8),
            BigNumber.from(255))
            expect(result).to.be.true
        
        }) 
    })

    describe('calculatePrizeForPrizeDistributionIndex()', () => {
        it('can calculate the prize awardable for the prize distribution and prize', async()=>{
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = bitRangeSize ^ distirbutionIndex = 4 ^ 1 = 4
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 4 = 0.05e18
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 0.05e18 = 5e36
            // div by 1e18 = 5e18

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
                prize: utils.parseEther("100"),
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            //calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: DrawSettings, draw: Draw)
            const prizeReceivable = calculatePrizeForPrizeDistributionIndex(1, exampleDrawSettings, exampleDraw)
            const prize = utils.parseEther("5")
            expect(prizeReceivable).to.deep.equal(prize)
        })

    })

    describe('calculateFractionOfPrize()', () => {
        it('can calculate the fraction for the prize distribution', async()=>{
            
            const exampleDrawSettings : DrawSettings = {
                distributions: [ethers.utils.parseEther("0.3"),
                                ethers.utils.parseEther("0.2"),
                                ethers.utils.parseEther("0.1")],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(3),
                bitRangeValue: BigNumber.from(15),
                bitRangeSize : BigNumber.from(4)
            }            
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = bitRangeSize ^ distirbutionIndex = 4 ^ 1 = 4
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 4 = 0.05e18
            
            const fraction = calculateFractionOfPrize(1, exampleDrawSettings)
            const expectedFraction = utils.parseEther("0.05")
            expect(fraction).to.deep.equal(expectedFraction)
        })

    })

    describe.only('calculatePrizeDistributedFromWinnerDistributionArray()', () => {
        it('can calculate the total payout for the WinnerDistributionArray', async()=>{
            
            const drawSettings : DrawSettings = {
                distributions: [
                                ethers.utils.parseEther("0.3"),
                                ethers.utils.parseEther("0.25"),
                                ethers.utils.parseEther("0.2"),
                                ethers.utils.parseEther("0.1"),
                                ethers.utils.parseEther("0.05")
                            ],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(5),
                bitRangeValue: BigNumber.from(7),
                bitRangeSize : BigNumber.from(3)
            }
            const prize : Prize = {
                value: utils.parseEther('100'),
            }                       

            let winnerDistributionArray =  [0,2,13,107,379]

            const totalPrizeDistributed = calculatePrizeDistributedFromWinnerDistributionArray(winnerDistributionArray, prize, drawSettings)
            const expectedResult = utils.parseEther("108.580246913580203")
            expect(totalPrizeDistributed).to.deep.equal(expectedResult)

        })

    })
})