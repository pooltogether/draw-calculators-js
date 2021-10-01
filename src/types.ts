import { BigNumber } from 'ethers';

export type PrizeDistribution = {
    matchCardinality: number;
    numberOfPicks: BigNumber;
    distributions: number[];
    bitRangeSize: number;
    prize: BigNumber;
    drawStartTimestampOffset?: number;
    drawEndTimestampOffset?: number;
    maxPicksPerUser: number;
};

export type Draw = {
    drawId: number;
    winningRandomNumber: BigNumber;
    timestamp?: number;
    beaconPeriodStartedAt?: number;
    beaconPeriodSeconds?: number;
};

export type Pick = {
    index: number;
    hash: string;
};

export type User = {
    address: string;
    normalizedBalances: BigNumber[];
    picks?: Pick[]; // optional as user may not have picks (under floor)
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
    data: string;
};

export type UserDrawResult = {
    user: User;
    // drawId: BigNumber
    drawResult: DrawResults;
};
