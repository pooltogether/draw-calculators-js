import {
  Pick
} from './types'
import { BigNumber } from 'ethers'
import { computePick } from './helpers/computePick'

export function computePicks(address: string, pickIndices: BigNumber[]): Pick[] {
  return pickIndices.map(index => computePick(address, index.toNumber()))
}