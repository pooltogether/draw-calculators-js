
import { BigNumber, ethers, utils } from "ethers";
import { expect } from "chai"
import { Claim, Draw, DrawResults, TsunamiDrawSettings, User } from "../src/types"
import { tsunamiDrawCalculator } from "../src/tsunamiDrawCalculator"
import { prepareClaims } from "../src/prepareClaims"

import { calculateFractionOfPrize } from "../src/helpers/calculateFractionOfPrize";
import { calculatePrizeAmount } from "../src/helpers/calculatePrizeAmount";

import { findBitMatchesAtIndex } from "../src/helpers/findBitMatchesAtIndex";
import { calculatePrizeForDistributionIndex } from "../src/helpers/calculatePrizeForDistributionIndex";


describe.only('tsunamiDrawCalculator()', () => {
    
    it('Single DrawCalculator run 1 matches', async () => {
        // distributionIndex = matchCardinality - numberOfMatches = 3 - 1 = 2
        // distributions[2] = 0.1e18 = prizeAtIndex
        // const numberOfPrizes = 2 ^ (bitRangeSize ^ distributionIndex) - ((2 ^ bitRangeSize) ^ distributionIndex - 1) = (2 ^ (4 ^ 2)) - (2 ^ 4 ^ (2- 1) = 240
        // fractionOfPrize = prizeAtIndex / numberOfPrizes = 0.1e18 / 240 = 4.166666666666667e14
        // prizeAwardable = prize * fractionOfPrize = 100e18 * 4.166666666666667e14 = 4.166666666666667e34
        // div by 1e18 = 4.166666666666667e16 = 0.0416666666666667e18
        
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }

        const exampleDraw : Draw = {
            drawId: BigNumber.from(1),
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }
        
        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            normalizedBalance: ethers.utils.parseEther("0.2"),
        }
        
        const results = tsunamiDrawCalculator([exampleDrawSettings], [exampleDraw], exampleUser)
        const expectedPrize = BigNumber.from("0x94079cd1a42a68") // const prizeReceived = utils.parseEther("0.041666666666666667")
        expect(results[0].totalValue).to.deep.equal(expectedPrize)
    })

    it.only('all matches', async () => {
        
        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            normalizedBalance: ethers.utils.parseEther("0.1"),
        } 
        
        const winningNumber = utils.solidityKeccak256(['address'], [exampleUser.address]);
        const winningRandomNumber = utils.solidityKeccak256(
          ['bytes32', 'uint256'],
          [winningNumber, 1],
        );

        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.4"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 4,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }
        
        const exampleDraw : Draw = {
            drawId: BigNumber.from(1),
            winningRandomNumber: BigNumber.from(winningRandomNumber)
        }
        
        const results = tsunamiDrawCalculator([exampleDrawSettings], [exampleDraw], exampleUser)
        console.log(results)
        // console.log(results[0].totalValue)
        // const prizeReceived = utils.parseEther("1.25")
        // expect(results.totalValue).to.deep.equal(prizeReceived)
    })
})

describe('calculatePrizeAmount()', () => {
    it('Can calculate the prize given the draw settings and number of matches', async () => {
        // const exampleDrawSettings : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: BigNumber.from(ethers.utils.parseEther("1")),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }
        
        const exampleDraw : Draw = {
            drawId: BigNumber.from(1),
            winningRandomNumber: BigNumber.from("9818474807567937660714483746420294115396450454986178514367709522842585653685")
        }
        
        const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 2)
        const prizeReceived = utils.parseEther("1.25")
        expect(result!.amount).to.deep.equal(prizeReceived)
        expect(result!.distributionIndex).to.deep.equal(1)
    
    })
    it('Can calculate the prize given the draw settings and number of matches', async () => {
        // const exampleDrawSettings : TsunamiDrawSettings = {
        //     distributions: [
        //         ethers.utils.parseEther("0.4"),
        //         ethers.utils.parseEther("0.2"),
        //         ethers.utils.parseEther("0.1"),
        //         ethers.utils.parseEther("0.1")],
        //     numberOfPicks: BigNumber.from(ethers.utils.parseEther("1")),
        //     matchCardinality: BigNumber.from(4),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }
        
        const exampleDraw : Draw = {
            drawId: BigNumber.from(1),
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }
        
        const result = calculatePrizeAmount(exampleDrawSettings, exampleDraw, 3)
        const prizeReceived = utils.parseEther("1.25")
        expect(result!.amount).to.deep.equal(prizeReceived)  
    })
})

describe('findBitMatchesAtIndex()', () => {
    it('Can findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(
            BigNumber.from(61676),
            BigNumber.from(61612),
            1,
            8
        )
        expect(result).to.be.true
    
    })

    it('Can NOT findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(BigNumber.from(61676),
        BigNumber.from(61612),
        1,
        6)
        expect(result).to.be.false
    
    })    
    
    it('Can findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(
        BigNumber.from("24703804328475188150699190457572086651745971796997325887553663750514688469872"),
        BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728"),
        1,
        8)
        expect(result).to.be.true
    
    }) 

    it('Can NOT findBitMatchesAtIndex', async () => {
        const result = findBitMatchesAtIndex(
        BigNumber.from("24703804328475188150699190457572086651745971796997325887553663750514688469872"),
        BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728"),
        2,
        8)
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

        // const exampleDrawSettings : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: BigNumber.from(ethers.utils.parseEther("1")),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }    
        
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }

        const exampleDraw : Draw = {
            drawId: BigNumber.from(1),
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }
        
        //calculatePrizeForPrizeDistributionIndex(prizeDistributionIndex: number, drawSettings: TsunamiDrawSettings, draw: Draw)
        const prizeReceivable = calculatePrizeForDistributionIndex(1, exampleDrawSettings, exampleDraw)
        const prize = utils.parseEther("1.25")
        expect(prizeReceivable).to.deep.equal(prize)
    })

})

describe('calculateFractionOfPrize()', () => {
    it('can calculate the fraction for the prize distribution', async()=>{
        
        // const exampleDrawSettings : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: BigNumber.from(ethers.utils.parseEther("1")),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }         
        
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
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

describe('prepareClaimForUserFromDrawResult()', () => {
    it('returns correct claim struct for user', async()=>{
        
        // const exampleDrawSettings : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: ethers.utils.parseEther("1"),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }
        const exampleDrawSettings : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }

        const drawId = BigNumber.from(2)
        const winningPickIndices = BigNumber.from(1)
        
        const exampleDraw : Draw = {
            drawId,
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }                 

        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            normalizedBalance: ethers.utils.parseEther("10"),
        }
        
        const drawResult = tsunamiDrawCalculator([exampleDrawSettings], [exampleDraw], exampleUser)

        const claimResult: Claim = prepareClaims(exampleUser, drawResult)
        expect(claimResult.drawIds).to.deep.equal([drawId])
        expect(claimResult.data).to.deep.equal([[winningPickIndices]])
    })
})

describe('prepareClaimsForUserFromDrawResults()', () => {
    it('returns correct claim struct for user', async()=>{
        
        // const exampleDrawSettings1 : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: ethers.utils.parseEther("1"),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(4),
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }
        const exampleDrawSettings1 : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }

        // const exampleDrawSettings2 : TsunamiDrawSettings = {
        //     distributions: [ethers.utils.parseEther("0.3"),
        //                     ethers.utils.parseEther("0.2"),
        //                     ethers.utils.parseEther("0.1")],
        //     numberOfPicks: ethers.utils.parseEther("1"),
        //     matchCardinality: BigNumber.from(3),
        //     bitRangeSize: BigNumber.from(10), // set very high so matching unlikely
        //     prize: BigNumber.from(utils.parseEther("100")),
        //     maxPicksPerUser: BigNumber.from(1000),
        // }

        const exampleDrawSettings2 : TsunamiDrawSettings = {
            distributions: [ethers.utils.parseEther("0.3"),
                            ethers.utils.parseEther("0.2"),
                            ethers.utils.parseEther("0.1")],
            numberOfPicks: 10,
            matchCardinality: 3,
            bitRangeSize: 4,          
            prize: BigNumber.from(utils.parseEther("100")),
            maxPicksPerUser: 100,
        }
        const drawIds= [BigNumber.from(2), BigNumber.from(3)]
        const winningPickIndices = BigNumber.from(1)
        
        const exampleDraw1 : Draw = {
            drawId: drawIds[0],
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }   
        const exampleDraw2 : Draw = {
            drawId: drawIds[1],
            winningRandomNumber: BigNumber.from("8781184742215173699638593792190316559257409652205547100981219837421219359728")
        }                 

        const exampleUser : User = {
            address: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
            normalizedBalance: ethers.utils.parseEther("10"),
        }
        
        const drawResults: DrawResults[] = tsunamiDrawCalculator(
            [exampleDrawSettings1, exampleDrawSettings2],
            [exampleDraw1, exampleDraw2],
            exampleUser)

        expect(drawResults.length).to.equal(1) // only wins exampleDraw1
        
        const claimResult: Claim = prepareClaims(exampleUser, drawResults)
        
        expect(claimResult.drawIds).to.deep.equal([drawIds[0]])
        expect(claimResult.data).to.deep.equal([[winningPickIndices]])
    })
})
