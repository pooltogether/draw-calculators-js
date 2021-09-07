
import { BigNumber, ethers, utils } from "ethers";
import { expect } from "chai"
import { Draw, DrawSettings, PrizeAwardable, User } from "../types/types"
import { runDrawCalculatorForSingleDraw, findBitMatchesAtIndex, calculatePrizeAmount, 
    calculatePrizeForPrizeDistributionIndex, calculateFractionOfPrize } from "../src/drawCalculator"

import {calculateNumberOfMatchesForPrize, calculateTotalPrizeDistributedFromWinnerDistributionArray} from "../src/helpers/calculatePrizeAmounts"

describe('drawCalculator', () => {
    describe('runDrawCalculatorForSingleDraw()', () => {
        
        it('Single DrawCalculator run 2 matches', async () => {
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18
            
            const exampleDrawSettings : DrawSettings = {
                distributions: [ethers.utils.parseEther("0.3"),
                                ethers.utils.parseEther("0.2"),
                                ethers.utils.parseEther("0.1")],
                pickCost: ethers.utils.parseEther("1"),
                matchCardinality: BigNumber.from(3),
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }

            
            const exampleDraw : Draw = {
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
            const prizeReceived = utils.parseEther("1.25")
            expect(results.totalValue).to.deep.equal(prizeReceived)
        })
    
        it('Second single DrawCalculator run 3 matches', async () => {
            
            // distributionIndex = matchCardinality - numberOfMatches = 4 - 3 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18
            const exampleDrawSettings : DrawSettings = {
                distributions: [
                    ethers.utils.parseEther("0.4"),
                    ethers.utils.parseEther("0.2"),
                    ethers.utils.parseEther("0.1"),
                    ethers.utils.parseEther("0.1")],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(4),
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }
            
            const exampleDraw : Draw = {
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            const exampleUser : User = {
                address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                balance: ethers.utils.parseEther("10"),
                pickIndices: [BigNumber.from(1)]
            } 
            
            const results = runDrawCalculatorForSingleDraw(exampleDrawSettings, exampleDraw, exampleUser)
            
            const prizeReceived = utils.parseEther("1.25")
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
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }
            
            const exampleDraw : Draw = {
                winningRandomNumber: BigNumber.from("9818474807567937660714483746420294115396450454986178514367709522842585653685")
            }
            
            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 2)
            const prizeReceived = utils.parseEther("1.25")
            expect(result!.amount).to.deep.equal(prizeReceived)
            expect(result!.distributionIndex).to.deep.equal(1)
        
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
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }
            
            const exampleDraw : Draw = {
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 3)
            const prizeReceived = utils.parseEther("1.25")
            expect(result!.amount).to.deep.equal(prizeReceived)  
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
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }
            
            const exampleDraw : Draw = {
                winningRandomNumber: BigNumber.from("9818474807567937660714483746420294115396450454986178514367709522842585653685")
            }
    
            const prizeReceived = utils.parseEther("1.25")
            
            const result = calculateNumberOfMatchesForPrize(exampleDrawSettings, exampleDraw, prizeReceived)
            expect(result).to.equal(2)
        
        })
    })

    describe('findBitMatchesAtIndex()', () => {
        it('Can findBitMatchesAtIndex', async () => {
            const exampleDrawSettings : DrawSettings = {
                distributions: [],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(4),
                bitRangeSize : BigNumber.from(8)
            }

            const result = findBitMatchesAtIndex(
                BigNumber.from(61676),
                BigNumber.from(61612),
                1,
                exampleDrawSettings
            )
            expect(result).to.be.true
        
        })

        it('Can NOT findBitMatchesAtIndex', async () => {
            const exampleDrawSettings : DrawSettings = {
                distributions: [],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(4),
                bitRangeSize : BigNumber.from(6),
                prize: BigNumber.from(utils.parseEther("100")),
            }

            const result = findBitMatchesAtIndex(BigNumber.from(61676),
            BigNumber.from(61612),
            1,
            exampleDrawSettings)
            expect(result).to.be.false
        
        })    
        
        it('Can findBitMatchesAtIndex', async () => {

            const exampleDrawSettings : DrawSettings = {
                distributions: [],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(4),
                bitRangeSize : BigNumber.from(8),
                prize: BigNumber.from(utils.parseEther("100")),
            }

            const result = findBitMatchesAtIndex(
            BigNumber.from("24703804328475188150699190457572086651745971796997325887553663750514688469872"),
            BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728"),
            1,
            exampleDrawSettings)
            expect(result).to.be.true
        
        }) 

        it('Can NOT findBitMatchesAtIndex', async () => {

            const exampleDrawSettings : DrawSettings = {
                distributions: [],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(4),
                bitRangeSize : BigNumber.from(8),
                prize: BigNumber.from(utils.parseEther("100")),
            }

            const result = findBitMatchesAtIndex(
            BigNumber.from("24703804328475188150699190457572086651745971796997325887553663750514688469872"),
            BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728"),
            2,
            exampleDrawSettings)
            expect(result).to.be.false
        
        }) 
    })

    describe('calculatePrizeForPrizeDistributionIndex()', () => {
        it('can calculate the prize awardable for the prize distribution and prize', async()=>{
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            // prizeAwardable = prize * fractionOfPrize = 100e18 * 1.25e16 = 1.25e36
            // div by 1e18 = 1.25e18

            const exampleDrawSettings : DrawSettings = {
                distributions: [ethers.utils.parseEther("0.3"),
                                ethers.utils.parseEther("0.2"),
                                ethers.utils.parseEther("0.1")],
                pickCost: BigNumber.from(ethers.utils.parseEther("1")),
                matchCardinality: BigNumber.from(3),
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }            
            const exampleDraw : Draw = {
                winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
            }
            
            //calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: DrawSettings, draw: Draw)
            const prizeReceivable = calculatePrizeForPrizeDistributionIndex(1, exampleDrawSettings, exampleDraw)
            const prize = utils.parseEther("1.25")
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
                bitRangeSize : BigNumber.from(4),
                prize: BigNumber.from(utils.parseEther("100")),
            }            
            // distributionIndex = matchCardinality - numberOfMatches = 3 - 2 = 1
            // distributions[1] = 0.2e18 = prizeAtIndex
            // const numberOfPrizes = bitRangeSize ^ distirbutionIndex = 2 ^ (4 ^ 1) = 16
            // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.2e18 / 16 = 1.25e16
            
            const fraction = calculateFractionOfPrize(1, exampleDrawSettings)
            const expectedFraction = utils.parseEther("0.0125")
            expect(fraction).to.deep.equal(expectedFraction)
        })

    })

    describe('calculatePrizeDistributedFromWinnerDistributionArray()', () => {
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
                bitRangeSize : BigNumber.from(3),
                prize: BigNumber.from(utils.parseEther("100")),
            }
            const draw : Draw = {
                winningRandomNumber: BigNumber.from(0) // not used
            }                       

            let winnerDistributionArray =  [0,2,13,107,379]

            const totalPrizeDistributed = calculateTotalPrizeDistributedFromWinnerDistributionArray(winnerDistributionArray, draw, drawSettings)
            const expectedResult = utils.parseEther("12.864990234375")
            
            expect(totalPrizeDistributed).to.deep.equal(expectedResult)

        })

    })
})