import { Field, ObjectType } from '@nestjs/graphql'
import { Collection } from './collection'

@ObjectType()
export class Target {
  @Field()
  id: string
  @Field()
  tokenId: string
  @Field()
  tokenURI: string
  @Field(() => Collection)
  collection: Collection
}
