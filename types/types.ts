import { BigNumber, Contract } from 'ethers';
import { Signer } from '@ethersproject/abstract-signer';
import { Provider, TransactionResponse } from '@ethersproject/abstract-provider';

// Simulation specific

export interface User {
    address: string;
    balance: BigNumber;
    pickIndices: BigNumber[];
}

export interface DrawSimulationResult {
    draw: Draw; // think all we need from this is the winningRandomNumber
    user: User; // need address - do we need pickIndices?
    drawSettings: DrawSettings;
    results: DrawResults;
}

export interface DrawSimulationResults {
    results: DrawSimulationResult[][];
}

// External interface

export interface DrawSettings {
    matchCardinality: BigNumber;
    pickCost: BigNumber;
    distributions: BigNumber[];
    bitRangeSize: BigNumber;
}

export interface DrawResults {
    totalAmount: BigNumber;
    prizes: ClaimablePickPrize[];
}

export interface ClaimablePickPrize extends PickPrize {
    pick: BigNumber; // populate with claim index
}

export interface PickPrize {
    amount: BigNumber;
    distributionIndex: number;
}

// New stuff

// - This is all class based. Just a personal preference (and partially copying Compound
// https://compound.finance/docs/compound-js) we could make it all individual functions,
// but then the user is just going to need to pass a lot more data all of the time.
// Ex. passing provider, prize pool address, prize strat address, etc. every fn call.
// - We need to fetch strat & version (and/or provide the users some consts) BEFORE making an instance of Tsunami.
// Otherwise we would need to fetch that data all the time or deal with some ugly mutations that
// might interfere with Reacts state.

/**
 *
 * ////// v0 User flow //////
 * const tsunamiPrizePoolConfig = await getPrizePoolConfig(prizePoolAddress)
 * const tsunamiPrizePool = new Tsunami(provider, tsunamiPrizePoolConfig)
 *
 * OR
 *
 * const tsunamiPrizePoolConfig = await getPrizePoolConfig(prizePoolAddress)
 * const tsunamiPrizePool = new Tsunami(provider, {
 *  prizePoolAddress,
 *  prizePoolStrategyAddress,
 *  '0.0.1'
 * })
 *
 */

/**
 * Enum for validating a supplied version of Tsunami.
 * Versions are used to match abis.
 */
export enum TsunamiVersion {
    '0.0.1' = '0.0.1',
}

/**
 * An instance of a draw
 */
interface Draw {
    id: number;
    prize: BigNumber;
    winningRandomNumber: BigNumber;
    timestamp: any; // TODO: What interface will this be?
}

/**
 * The possible states a prize period can be in
 */
export enum PrizePeriodStates {
    active = 'active', // !canStartAward && !canCompleteAward
    canStartAward = 'canStartAward', // canStartAward
    canCompleteAward = 'canCompleteAward', // canCompleteAward
}

/**
 * A view into a prize period.
 * Currently I expect this to only be used for the current prize period as Draws are more
 * important when looking at historic data
 */
interface PrizePeriod {
    drawId: number; // TODO: nextDrawId from ClaimableDraw?
    // prizeEstimate: BigNumber TODO: ????
    state: PrizePeriodStates;
    // Passthrough data from chain reads
    _prizePeriodSeconds: number;
    _prizePeriodStartedAt: number;
    _canStartAward: boolean;
    _canCompelteAward: boolean;
    _isRngRequested: boolean;
    _isRngTimedOut: boolean;
    _isRngCompleted: boolean;
}

/**
 * Minimal config to be able to query all of the data needed for a Tsunami app
 */
interface PrizePoolConfig {
    prizePoolAddress: string;
    prizeStrategyAddress: string;
    version: TsunamiVersion;
}

/**
 * Main class for reading Tsunami Prize Pool Data.
 */
export declare class Tsunami implements PrizePoolConfig {
    // Data
    provider: Provider;
    prizePoolAddress: string;
    prizeStrategyAddress: string;
    // version: So we can determine which abi to use.
    version: TsunamiVersion;
    contract: Contract;

    // Constructor
    constructor(provider: Provider, prizePoolConfig: PrizePoolConfig);

    // Methods
    getDraw(drawId: number): Draw;
    getCurrentPrizePeriod(): PrizePeriod;
    getUsersDrawResults(usersAddress: string, drawId: number): DrawResults;
    // TODO: getUsersTokenBalances(): TokenBalancesResponse

    // Static methods
    static getClaimableDrawIds(): number[];
    static getPrizePoolConfig(prizePoolAddress: string): PrizePoolConfig;
    static getPrizeStrategyAddress(prizePoolAddress: string): string;
    static getPrizePoolVersion(prizePoolAddress: string): TsunamiVersion;

    // static getTokenFaucets: Not necessary for v0. Return token faucets straight from the contract.
    // Users might want historic token faucets that have expired one day, we'll need a db, KV,
    // or to do some log digging.
    // getTokenFaucets: () => string[]
}

/**
 * Main class for a user to interact with a Tsunami Prize Pool
 */
export declare class TsunamiPlayer {
    signer: Signer;
    tsunami: Tsunami;

    constructor(signer: Signer, tsunami: Tsunami);

    // Methods
    deposit(amount: BigNumber): Promise<TransactionResponse>;
    withdraw(amount: BigNumber): Promise<TransactionResponse>;

    // getTokenBalances(): TokenBalancesResponse
}
