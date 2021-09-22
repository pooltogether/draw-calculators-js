import { BigNumber } from 'ethers';

export type DrawSettings = {
    matchCardinality: number;
    pickCost: BigNumber;
    distributions: number[];
    bitRangeSize: number;
    maxPicksPerUser: number;
    numberOfPicks: BigNumber;
    prize: BigNumber;
    drawStartTimestampOffset: number;
    drawEndTimestampOffset: number;
};

export type Draw = {
    drawId: number;
    winningRandomNumber: BigNumber;
    timestamp: number;
};

export type Pick = {
    index: number;
    hash: string;
};

export type User = {
    address: string;
    balance: BigNumber;
    pickIndices: BigNumber[];
};

export type DrawResults = {
    drawId: number;
    totalValue: BigNumber;
    prizes: PrizeAwardable[];
};

// prize that a User can receive
export type PrizeAwardable = {
    amount: BigNumber;
    distributionIndex: number;
    pick: BigNumber; //populate with claim index
};

export type PickPrize = {
    amount: BigNumber;
    distributionIndex: number;
};

export type Claim = {
    userAddress: string;
    drawIds: number[];
    data: BigNumber[][];
};

export type UserDrawResult = {
    user: User;
    // drawId: BigNumber
    drawResult: DrawResults;
};
