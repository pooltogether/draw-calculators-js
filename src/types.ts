import { BigNumber } from "ethers";

export type PrizeDistribution  = {
    matchCardinality: number;
    numberOfPicks: number;
    distributions: BigNumber[];
    bitRangeSize: number;
    prize: BigNumber;
    drawStartTimestampOffset?: number;
    drawEndTimestampOffset?: number;
    maxPicksPerUser: number;
}

export type Draw = {
    drawId: BigNumber;
    winningRandomNumber: BigNumber;
    timestamp?: number;
    beaconPeriodStartedAt?: number;
    beaconPeriodSeconds?: number;
}

export type Pick = {
    index: number,
    hash: string
}

export type User = {
    address: string
    normalizedBalance: BigNumber
    picks?: Pick[] // optional as user may not have picks (under floor)
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