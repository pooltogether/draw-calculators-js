import { BigNumber } from "ethers";

export type DrawSettings  = {
    matchCardinality: BigNumber
    pickCost: BigNumber
    distributions: BigNumber[]
    bitRangeSize: BigNumber
}

export type Draw = {
    prize: BigNumber
    winningRandomNumber: BigNumber
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
    pick: BigNumber //populate with claim index
}

export type PickPrize = {
    amount: BigNumber
    distributionIndex: number
}

export type DrawSimulationResult = {
    draw: Draw // think all we need from this is the winningRandomNumber
    user: User // need address - do we need pickIndices?
    drawSettings: DrawSettings
    results : DrawResults
}

export type DrawSimulationResults = {
    results: DrawSimulationResult[][]
}