import { Command } from 'commander'
import { computeDrawResults, generatePicks } from '.'
import { BigNumber, ethers } from 'ethers'
import { TsunamiDrawSettings, Draw } from './types'
import chalk from 'chalk'

const dim = function (...args: any[]) { console.log(chalk.dim(...args)) }
const toWei = (val: any) => ethers.utils.parseEther(val)
const bn = (val: any) => ethers.BigNumber.from(val)

const program = new Command()

program
  .option('-a, --address <address>', 'address to compute for')
  .option('-b, --bit-range <number>', 'bit range', '3')
  .option('-c, --cardinality <number>', 'cardinality', '6')
  .option('-w, --winning-number <string>', 'winning random number', ethers.BigNumber.from(ethers.utils.randomBytes(32)).toString())
  .action(async (options, command) => {
    dim(`Using bitRange + cardinality: ${options.bitRange}, ${options.cardinality}`)
    const totalPicks = (2**parseInt(options.bitRange))**parseInt(options.cardinality)
    let picks = generatePicks(options.address, totalPicks)
    dim(`Total picks:`, picks.length)

    const distributions = [
      bn('0'),
      bn(toWei('0.5'))
    ]

    let numPrizes = 0
    for (let i = 0; i < distributions.length; i++) {
      const num = (2**parseInt(options.bitRange))**i;
      numPrizes += num
      dim(`There are ${num} prizes for index ${i}`)
    }
    dim(`There are ${numPrizes} total prizes`)

    const drawSettings: TsunamiDrawSettings = {
      matchCardinality: BigNumber.from(options.cardinality),
      bitRangeSize: BigNumber.from(options.bitRange),
      distributions,
      prize: ethers.utils.parseEther('100'),
      numberOfPicks: ethers.BigNumber.from(1),
      maxPicksPerUser: ethers.BigNumber.from(1000),
    }

    const draw: Draw = {
      winningRandomNumber: ethers.BigNumber.from(options.winningNumber),
      drawId: ethers.BigNumber.from(1)
    }

    const drawResults = computeDrawResults(drawSettings, draw, picks)

    dim(`Number of prizes won: ${drawResults.prizes.length}`)

    const counts = new Array(distributions.length)
    drawResults.prizes.forEach(prize => {
      counts[prize.distributionIndex] = counts[prize.distributionIndex] || []
      counts[prize.distributionIndex].push(prize)
    })

    for (let i=  0; i < counts.length; i++) {
      if (counts[i]) {
        dim(`Prize ${i} won ${counts[i].length} times`)
      }
    }

  })
  .command('count')
  .action(async (options, command) => {
    const { bitRange, cardinality, address } = command.parent._optionValues
    
    const card = parseInt(cardinality)
    const range = 2**parseInt(bitRange)
    const numberOfPermutations = range**card
    console.log(range, card, numberOfPermutations)
    const allPermutations = new Array(numberOfPermutations)
    
    for (let i = 0; i < allPermutations.length; i++) {
      allPermutations[i] = []
      for (let j = 0; j < card; j++) {
        allPermutations[i][j] = Math.floor(i / range**j) % range
      }
      // console.log(allPermutations[i])
    }

    const matching = 2
    const test = [...new Array(card).keys()].map(() => Math.floor(Math.random() * range))

    
    const matches = []
    
    for (let i = 0; i < allPermutations.length; i++) {
      let count = 0
      const permutation = allPermutations[i]
      // instead, we must match them sequentially
      for (let j = 0; j < permutation.length; j++) {
        if (permutation[j] == test[j]) {
          count++
        } else {
          j = permutation.length
        }
      }
      if (count == matching) {
        matches.push(permutation)
        // console.log(permutation, "matches")
      }
    }
    
    console.log(test, ':: test')
    console.log(`Number of permutations that start with first ${matching} numbers: ${matches.length}`)


    // estimated prize count

    for (let i = 0; i < cardinality - 1; i++) {
      let match = cardinality - i

      console.log(`Prize ${i} should have ${range**(cardinality - match) - (match < cardinality ? range**(cardinality - match - 1) : 0)}`)
    }

  })

program.showHelpAfterError()
program.parse(process.argv)

/*

number of objects: 2
choose: 4

match *only* first two

5, 6, 7, 2

how many number start with 5, 6?

8*8

How many of those have 7 on end?

8**2 - 8

How many match 3?

8**1


Number remaining - number that match 3

8**(5-2) - 8**(5-3)

*/