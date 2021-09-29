import { ethers } from 'ethers'
import { calculateNumberOfPicksForUser } from './helpers/calculateNumberOfPicksForUser'
import { computePick } from './helpers/computePick'
import { Pick, PrizeDistribution, User } from "./types"

export function generatePicks(prizeDistribution: PrizeDistribution, user: User) : Pick[] {
  let numberOfPicks = calculateNumberOfPicksForUser(prizeDistribution, user.normalizedBalance)
  
  const usersAddressHashed = ethers.utils.solidityKeccak256(['address'], [user.address])

  let picks: Pick[] = []

  for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
    picks.push(computePick(usersAddressHashed, pickIndex))
  }
  return picks
}