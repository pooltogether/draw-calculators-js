import { ethers } from 'ethers'
import { computeCardinality } from '../src/computeCardinality'

describe('computeCardinality()', () => {
  it('will find lowest amount', () => {
    const totalSupply = ethers.utils.parseEther('10000000')

    expect(
      computeCardinality(
        3,
        totalSupply
      )
    ).toEqual(7)
  })

  it('is never zero', () => {
    const totalSupply = ethers.utils.parseEther('0')

    expect(
      computeCardinality(
        3,
        totalSupply
      )
    ).toEqual(2)
  })

  it('can adapt to other decimal precision', () => {
    expect(
      computeCardinality(
        3,
        ethers.utils.parseUnits('10000000', 9),
        9
      )
    ).toEqual(7)
  })
})
