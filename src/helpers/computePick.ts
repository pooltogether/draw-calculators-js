import { Pick } from '../types'
import { ethers } from 'ethers'

export function computePick(address: string, pick: number): Pick {
  const userRandomNumber = ethers.utils.solidityKeccak256(["address"], [address])
  const abiEncodedValue = ethers.utils.solidityPack(["bytes32","uint256"],[userRandomNumber,pick])
  return {
    index: pick,
    hash: ethers.utils.keccak256(abiEncodedValue)
  }
}