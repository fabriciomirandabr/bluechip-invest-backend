import { Args, Query, Resolver } from '@nestjs/graphql'
import { InvestmentService } from './investment.service'
import { Investment } from './models/investment'

@Resolver()
export class InvestmentResolver {
  constructor(private investmentService: InvestmentService) {}

  @Query(() => Investment, { name: 'investment', nullable: true })
  async getInvestment(@Args('collectionAddress') collectionAddress: string, @Args('chainId') chainId: number): Promise<Investment | null> {
    return this.investmentService.getInvestment(collectionAddress, chainId)
  }
}
