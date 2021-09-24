import { filterResultsByValue } from "../src/helpers/filterResultsByValue";
import { BigNumber, ethers, utils } from 'ethers'
import { expect } from "chai"
import { DrawResults, TsunamiDrawSettings } from "../src/types";



describe('filterResultsByValue()', () => {
  it('should slice to the correct amount', () => {
    const results: DrawResults = 
            {
                drawId: BigNumber.from(1), 
                totalValue: BigNumber.from(1),
                prizes:[
                    {
                        amount: BigNumber.from(1),
                        distributionIndex: 1,
                        pick: BigNumber.from(1)
                    }
                ]
            }
    const filteredResults = filterResultsByValue(results, 2)
    expect(filteredResults.prizes.length).to.equal(1)


  })
})

