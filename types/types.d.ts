import { BigNumber } from "ethers";

export type DrawSettings  = {
    matchCardinality: BigNumber
    pickCost: BigNumber
    distributions: BigNumber[]
    bitRangeSize: BigNumber
    prize: BigNumber
}

export type Draw = {
    winningRandomNumber: BigNumber
    //timestamp
    //drawId
}

export type User = {
    address: string
    balance: BigNumber
    pickIndices: BigNumber[]
}

export type DrawResults = {
    totalValue: BigNumber
    prizes: PrizeAwardable[]
}

// prize that a User can receive 
export type PrizeAwardable = {
    amount: BigNumber
    distributionIndex: number
    pick: BigNumber //populate with winning claim index
}

export type PickPrize = {
    amount: BigNumber
    distributionIndex: number
}

export type UserDrawResult = {
    user: User,
    drawResult: DrawResults
}