import { utils, BigNumber } from 'ethers'

export function computeCardinality(
    bitRangeSize: number,
    totalSupply: BigNumber,
    totalSupplyDecimals: number = 18
): number {
    const range = 2**bitRangeSize

    let matchCardinality = 2

    let numberOfPicks
    do {
        numberOfPicks = utils.parseUnits(`${range**++matchCardinality}`, totalSupplyDecimals)
    } while (numberOfPicks.lt(totalSupply))

    matchCardinality--

    return matchCardinality
}