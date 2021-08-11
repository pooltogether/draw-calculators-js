// export function findBitMatchesAtIndex(word1: BigNumber, word2: BigNumber, indexOffset: BigNumber, bitRangeValue: BigNumber): boolean {

import { BigNumber } from "ethers";

//     const word1DataHexString: string = word1.toHexString()
//     const word2DataHexString: string = word2.toHexString()
    
//     console.log(word1DataHexString)
//     console.log(word2DataHexString)

//     const mask : BigInt = BigInt(bitRangeValue.toString()) << BigInt(indexOffset.toString())
//     console.log("mask: ", mask)

//     const bits1 = BigInt(word1DataHexString) & BigInt(mask)
//     const bits2 = BigInt(word2DataHexString) & BigInt(mask)
//     console.log("attempting to match ", bits1.toString(), " with", bits2.toString())
//     return bits1 == bits2
// }





    // const result = findBitMatchesAtIndex(
    //     BigNumber.from(BigInt(24703804328475188150699190457572086651745971796997325887553663750514688469872)),
    //     BigNumber.from(BigInt(8781184742215173699638593792190316559257409652205547100981219837421219359728)),
    //     BigNumber.from(8),
    //     BigNumber.from(255)
    // )

import * as bigintConversion from 'bigint-conversion'

const randomNumberThisPick : string = "24703804328475188150699190457572086651745971796997325887553663750514688469872"
const winningRandomNumber : string = "8781184742215173699638593792190316559257409652205547100981219837421219359728"

let buffer = new ArrayBuffer(256) // 256 / 8 = 32 bytes * 8 (bytes per uint64)
let view = new BigUint64Array(buffer) // using uint64 since then we can store up to 64 bits (if we consider 4 64 bits) i.e bitRangeSize = 64 

// now populate it 
// EVM is little endian for numbers

const testNumber = "2048"

const result = bigintConversion.bigintToBuf(BigInt(testNumber), true)
console.log("conversion result ", result)
let conversionView = new Uint16Array(result)
console.log("conversionView size : ", conversionView)
console.log(conversionView[0])



