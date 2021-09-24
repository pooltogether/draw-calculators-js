import { Pick } from '../types'
import { ethers } from 'ethers'

export function computePick(address: string, pick: number): Pick {
  const abiEncodedValue = ethers.utils.solidityPack(["bytes32","uint256"],[address, pick])
  const userRandomNumber = ethers.utils.solidityKeccak256(["address"], [abiEncodedValue])
  return {
    index: pick,
    hash: ethers.utils.keccak256(userRandomNumber)
  }
}