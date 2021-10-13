import { BigNumber } from 'ethers';

const debug = require('debug')('pt:tsunami-sdk-drawCalculator');

//SOLIDITY SIG: function _findBitMatchesAtIndex(uint256 word1, uint256 word2, uint256 indexOffset, uint8 _bitRangeMaskValue)
export function findBitMatchesAtIndex(
    word1: BigNumber,
    word2: BigNumber,
    matchIndex: number,
    bitRangeSize: number,
): boolean {
    const indexOffset: number = matchIndex * bitRangeSize;
    debug(`indexOffset: `, indexOffset);

    const word1DataHexString: string = word1.toHexString();
    const word2DataHexString: string = word2.toHexString();

    debug(word1DataHexString);
    debug(word2DataHexString);

    const bitRangeMaxInt = Math.pow(2, bitRangeSize) - 1;
    // debug(`Max int: `, bitRangeMaxInt.toString(16))
    const mask: BigInt = BigInt(bitRangeMaxInt) << BigInt(indexOffset.toString());

    // debug(mask.toString(16))

    const bits1 = BigInt(word1DataHexString) & BigInt(mask);
    // debug(`bits1: `, bits1.toString(16))
    const bits2 = BigInt(word2DataHexString) & BigInt(mask);
    // debug(`bits2: `, bits2.toString(16))
    const match = bits1 == bits2;
    debug(`DrawCalculator:: matching ${bits1.toString()} with ${bits2.toString()}: ${match}`);
    return match;
}
