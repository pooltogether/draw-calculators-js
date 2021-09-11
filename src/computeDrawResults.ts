import {
  Pick,
  PrizeAwardable,
  DrawSettings,
  Draw,
  DrawResults
} from './types'
import { calculatePickFraction } from "./helpers/calculatePickFraction"
import { ethers } from 'ethers'

export function computeDrawResults(drawSettings: DrawSettings, draw: Draw, picks: Pick[]): DrawResults {
  const results: DrawResults = {
    prizes: [],
    totalValue: ethers.constants.Zero,
    drawId: draw.drawId
  }
  for (let i = 0; i < picks.length; i++) {
    const pick = picks[i]
    const pickPrize = calculatePickFraction(pick.hash, draw.winningRandomNumber, drawSettings, draw)
    if (pickPrize) {
      const prizeAwardable : PrizeAwardable = {
          ...pickPrize,
          pick: ethers.BigNumber.from(pick.index)
      }
      results.totalValue = results.totalValue.add(prizeAwardable.amount)  // prize += calculatePickFraction(randomNumberThisPick, winningRandomNumber, _drawSettings);
      results.prizes.push(prizeAwardable)
    }
  }
  return results
}