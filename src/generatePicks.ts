import { computePick } from './helpers/computePick'
import { Pick } from "./types"

export function generatePicks(address: string, numberOfPicks: number) : Pick[] {
  let picks: Pick[] = []
  for (let pickIndex = 0; pickIndex < numberOfPicks; pickIndex++) {
    picks.push(computePick(address, pickIndex))
  }
  return picks
}