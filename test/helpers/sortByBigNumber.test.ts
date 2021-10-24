import { BigNumber } from 'ethers';
import { expect } from 'chai';
import { sortByBigNumberAsc, sortByBigNumberDesc } from '../../src/helpers/sortByBigNumber';

describe('sortByBigNumberAsc', () => {
    it('should sort an array of BigNumbers in ascending order', () => {
        const bigNumbers: BigNumber[] = [
            BigNumber.from(100),
            BigNumber.from(12),
            BigNumber.from(1),
            BigNumber.from(1000),
        ];
        const expectedBigNumbers: BigNumber[] = [
            BigNumber.from(1),
            BigNumber.from(12),
            BigNumber.from(100),
            BigNumber.from(1000),
        ];
        const sortedBigNumbers = bigNumbers.sort(sortByBigNumberAsc);
        const isEqual = sortedBigNumbers.reduce(
            (prev, current, index) => prev && current.eq(expectedBigNumbers[index]),
            true,
        );
        expect(isEqual).true;
    });
});

describe('sortByBigNumberDesc', () => {
    it('should sort an array of BigNumbers in descending order', () => {
        const bigNumbers: BigNumber[] = [
            BigNumber.from(100),
            BigNumber.from(12),
            BigNumber.from(1),
            BigNumber.from(1000),
        ];
        const expectedBigNumbers: BigNumber[] = [
            BigNumber.from(1000),
            BigNumber.from(100),
            BigNumber.from(12),
            BigNumber.from(1),
        ];
        const sortedBigNumbers = bigNumbers.sort(sortByBigNumberDesc);
        const isEqual = sortedBigNumbers.reduce(
            (prev, current, index) => prev && current.eq(expectedBigNumbers[index]),
            true,
        );
        expect(isEqual).true;
    });
});
