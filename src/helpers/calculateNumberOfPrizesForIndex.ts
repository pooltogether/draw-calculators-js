export function calculateNumberOfPrizesForIndex(
    bitRangeSize: number,
    prizeDistributionIndex: number,
): number {
    let bitRangeDecimal = 2 ** bitRangeSize;
    let numberOfPrizesForIndex = bitRangeDecimal ** prizeDistributionIndex;

    while (prizeDistributionIndex > 0) {
        numberOfPrizesForIndex -= bitRangeDecimal ** (prizeDistributionIndex - 1);
        prizeDistributionIndex--;
    }

    return numberOfPrizesForIndex;
}
