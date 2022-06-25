import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Collection {
  @Field()
  id: string
  @Field()
  name: string
  @Field()
  symbol: string
}
