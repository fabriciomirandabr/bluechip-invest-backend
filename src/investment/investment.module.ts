import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { InvestmentResolver } from './investment.resolver'
import { InvestmentService } from './investment.service'
import { SubgraphClientProvider } from './providers/subgraph-client.provider'

@Module({
  providers: [InvestmentService, SubgraphClientProvider, InvestmentResolver],
  imports: [ConfigModule],
  exports: [InvestmentService]
})
export class InvestmentModule {}
