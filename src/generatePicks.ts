import { ethers } from 'ethers'
import { calculateNumberOfPicksForUser } from './helpers/calculateNumberOfPicksForUser'
import { computePick } from './helpers/computePick'
import { Pick, TsunamiDrawSettings, User } from "./types"

export function generatePicks(drawSettings: TsunamiDrawSettings, user: User) : Pick[] {
  let numberOfPicks = calculateNumberOfPicksForUser(drawSettings, user.normalizedBalance)
  
  const usersAddressHashed = ethers.utils.solidityKeccak256(['address'], [user.address])
  console.log("usersAddressHashed ", usersAddressHashed)
  let picks: Pick[] = []

  for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
    picks.push(computePick(usersAddressHashed, pickIndex))
  }
  return picks
}