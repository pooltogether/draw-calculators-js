import { BigNumber } from "ethers"
import { DrawSettings } from "../types"

const debug = require('debug')('pt:tsunami-sdk-drawCalculator')

//SOLIDITY SIG: function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue) 
export function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, matchIndex: number, _drawSettings: DrawSettings): boolean {

    const indexOffset: number = matchIndex * _drawSettings.bitRangeSize.toNumber()
    const word1DataHexString: string = word1.toHexString()
    const word2DataHexString: string = word2.toHexString()
    const bitRangeValue: string = (Math.pow(2, _drawSettings.bitRangeSize.toNumber()) - 1).toString()
    const mask : BigInt = BigInt(bitRangeValue) << BigInt(indexOffset.toString())
    const bits1 = BigInt(word1DataHexString) & BigInt(mask)
    const bits2 = BigInt(word2DataHexString) & BigInt(mask)
    debug(`DrawCalculator:: matching ${bits1.toString()} with ${bits2.toString()}`)
    return bits1 == bits2
}