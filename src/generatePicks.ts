import { BigNumber } from 'ethers'
import { computePick } from './helpers/computePick'
import { Pick } from "./types"

export function generatePicks(pickCost: BigNumber, address: string, balance: BigNumber) : Pick[] {
  let numberOfPicks = balance.div(pickCost).toNumber()
  let picks: Pick[] = []
  for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
    picks.push(computePick(address, pickIndex))
  }
  return picks
}