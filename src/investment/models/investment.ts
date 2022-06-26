import { Field, Int, ObjectType } from '@nestjs/graphql'
import { Listing } from './listing'

@ObjectType()
export class Investment {
  @Field()
  contractAddress: string
  @Field()
  availableTokenId: string
  @Field({ nullable: true })
  name?: string
  @Field({ nullable: true })
  image?: string
  @Field({ nullable: true })
  slug?: string
  @Field({ nullable: true })
  description?: string
  @Field({ nullable: true })
  floorPrice?: number
  @Field({ nullable: true })
  floorSaleChangeToday?: number
  @Field({ nullable: true })
  volumeToday?: number
  @Field(() => Int, { nullable: true })
  whalesRankToday?: number
  @Field(() => Listing, { nullable: true })
  activeRound?: Listing
  @Field(() => [Listing], { nullable: true })
  lastRounds?: Listing[]
}
