import { BigNumber } from '@ethersproject/bignumber';

export const sortByBigNumberAsc = (a: BigNumber, b: BigNumber) => {
    const aSubB = a.sub(b);
    if (aSubB.isZero()) return 0;
    if (aSubB.isNegative()) return -1;
    return 1;
};

export const sortByBigNumberDesc = (a: BigNumber, b: BigNumber) => {
    const bSubA = b.sub(a);
    if (bSubA.isZero()) return 0;
    if (bSubA.isNegative()) return -1;
    return 1;
};
