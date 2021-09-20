import { BigNumber } from "ethers";

export type TsunamiDrawSettings  = {
    matchCardinality: BigNumber;
    numberOfPicks: BigNumber;
    distributions: BigNumber[];
    bitRangeSize: BigNumber;
    prize: BigNumber;
    drawStartTimestampOffset: BigNumber;
    drawEndTimestampOffset: BigNumber;
    maxPicksPerUser: BigNumber;
}

export type Draw = {
    drawId: BigNumber
    winningRandomNumber: BigNumber
}

export type Pick = {
    index: number,
    hash: string
}

export type User = {
    address: string
    balance: BigNumber
    pickIndices: BigNumber[]
}

export type DrawResults = {
    drawId: BigNumber
    totalValue: BigNumber
    prizes: PrizeAwardable[]
}

// prize that a User can receive 
export type PrizeAwardable = {
    amount: BigNumber
    distributionIndex: number
    pick: BigNumber //populate with claim index
}

export type PickPrize = {
    amount: BigNumber
    distributionIndex: number
}

export type Claim = {
    userAddress: string
    drawIds: BigNumber[]
    data: BigNumber[][]
}

export type UserDrawResult = {
    user: User
    // drawId: BigNumber
    drawResult: DrawResults
}