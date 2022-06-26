import { Field, ObjectType } from '@nestjs/graphql'
import { Buyer } from './buyer'
import { Target } from './target'

@ObjectType()
export class Listing {
  @Field()
  id: string
  @Field()
  status: string
  @Field()
  amount: string
  @Field()
  sellerNetAmount: string
  @Field({ nullable: true })
  acquiringData?: string
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
  @Field({ nullable: true })
  fractions?: string
  @Field({ nullable: true })
  fractionsCount?: string
  @Field(() => Target)
  target: Target
  @Field(() => [Buyer])
  buyers: Buyer[]
  @Field({ nullable: true })
  image?: string
}
