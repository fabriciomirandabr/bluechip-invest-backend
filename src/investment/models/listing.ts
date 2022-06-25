import { Field, ObjectType } from '@nestjs/graphql'
import { Buyer } from './buyer'
import { Target } from './target'

@ObjectType()
export class Listing {
  @Field()
  id: string
  @Field()
  amount: string
  @Field()
  sellerNetAmount: string
  @Field()
  sellerFeeAmount: string
  @Field()
  fee: string
  @Field()
  reservePrice: string
  @Field()
  timestamp: string
  @Field()
  buyersCount: string
  @Field()
  fractions: string
  @Field()
  fractionsCount: string
  @Field(() => Target)
  target: Target
  @Field(() => [Buyer])
  buyers: Buyer[]
}
