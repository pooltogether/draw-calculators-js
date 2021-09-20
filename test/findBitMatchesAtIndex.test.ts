import { findBitMatchesAtIndex } from "../src/helpers/findBitMatchesAtIndex";
import { ethers } from 'ethers'
import { expect } from "chai"

const bn = (num: any) => ethers.BigNumber.from(num)
const bin = (binaryString: string) => bn(parseInt(binaryString, 2))

describe('findBitMatchesAtIndex', () => {
  it('should match the last number', () => {
    expect(findBitMatchesAtIndex(bin('11001111'), bin('10101111'), 0, 4)).to.be.true
    expect(findBitMatchesAtIndex(bin('11001110'), bin('10101111'), 1, 4)).to.be.false
  })

  it('should match for odd bits', () => {
    expect(findBitMatchesAtIndex(bin('111001111'), bin('111100111'), 0, 3)).to.be.true
    expect(findBitMatchesAtIndex(bin('111001111'), bin('111100111'), 1, 3)).to.be.false
    expect(findBitMatchesAtIndex(bin('111001111'), bin('111100111'), 2, 3)).to.be.true
  })
})