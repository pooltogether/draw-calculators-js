import { utils } from 'ethers';

export const formatDistributionNumber = (distribution: string) =>
    utils.parseUnits(distribution, 9).toNumber();
