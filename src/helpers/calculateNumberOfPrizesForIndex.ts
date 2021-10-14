export function calculateNumberOfPrizesForIndex(
    bitRangeSize: number,
    tierIndex: number,
): number {
    // Prize Count = (2**bitRange)**(cardinality-numberOfMatches)
    // if not grand prize: - (2^bitRange)**(cardinality-numberOfMatches-1) - ... (2^bitRange)**(0)
    if (tierIndex > 0) {
        return (1 << (bitRangeSize * tierIndex)) - (1 << (bitRangeSize * (tierIndex - 1)))
    } else {
        return 1
    }
}
