import { Args, Mutation, Query, Resolver } from '@nestjs/graphql'
import { FinishedRound } from './dto/finished-round'
import { InvestmentService } from './investment.service'
import { Investment } from './models/investment'

@Resolver()
export class InvestmentResolver {
  constructor(private investmentService: InvestmentService) {}

  @Query(() => Investment, { name: 'investment', nullable: true })
  async getInvestment(@Args('collectionAddress') collectionAddress: string, @Args('chainId') chainId: number): Promise<Investment | null> {
    return this.investmentService.getInvestment(collectionAddress, chainId)
  }

  @Mutation(() => Boolean, { name: 'finishRound' })
  async finishRound(@Args() args: FinishedRound) {
    const { chainId, listingId } = args

    try {
      await this.investmentService.saveFinishedListing(listingId, chainId)

      return true
    } catch (error) {
      return false
    }
  }
}
