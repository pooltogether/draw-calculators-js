import { filterResultsByValue } from "../src/helpers/filterResultsByValue";
import { BigNumber } from 'ethers'
import { expect } from "chai"
import { DrawResults } from "../src/types";



describe('filterResultsByValue()', () => {
  it('should slice to the correct amount, filters out prizes[0]', () => {
    const results: DrawResults = 
            {
                drawId: 1, 
                totalValue: BigNumber.from(1),
                prizes:[
                    {
                        amount: BigNumber.from(1),
                        distributionIndex: 1,
                        pick: BigNumber.from(1)
                    },
                    {
                      amount: BigNumber.from(2),
                      distributionIndex: 1,
                      pick: BigNumber.from(1)
                    },
                    {
                      amount: BigNumber.from(3),
                      distributionIndex: 1,
                      pick: BigNumber.from(1)
                    }
                ]
            }
    const filteredResults = filterResultsByValue(results, 2)
    expect(filteredResults.prizes.length).to.equal(2)
    console.log(filteredResults)
    // expect(filteredResults.prizes[0]).to.equal(results.prizes[1])
  })
})

