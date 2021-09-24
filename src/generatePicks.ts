import { calculateNumberOfPicksForUser } from './helpers/calculateNumberOfPicksForUser'
import { computePick } from './helpers/computePick'
import { Pick, TsunamiDrawSettings, User } from "./types"

export function generatePicks(drawSettings: TsunamiDrawSettings, user: User) : Pick[] {
  let numberOfPicks = calculateNumberOfPicksForUser(drawSettings, user.normalizedBalance)
  
  let picks: Pick[] = []
  for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
    picks.push(computePick(user.address, pickIndex))
  }
  return picks
}