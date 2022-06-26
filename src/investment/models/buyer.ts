import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Buyer {
  @Field()
  buyer: string
  @Field()
  amount: string
  @Field()
  ownership: string
  @Field({ nullable: true })
  fractionsCount: string
}
