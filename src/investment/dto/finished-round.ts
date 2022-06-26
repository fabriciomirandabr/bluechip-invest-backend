import { ArgsType, Field, Int } from '@nestjs/graphql'

@ArgsType()
export class FinishedRound {
  @Field(() => Int)
  chainId: number
  @Field()
  listingId: string
}
