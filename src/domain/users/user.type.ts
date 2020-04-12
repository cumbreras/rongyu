import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export default class User {
  @Field()
  id: string

  @Field()
  name: string

  @Field()
  username: string

  @Field()
  password: string

  @Field()
  token: string
}

export interface IUser {
  id: string
  name: string
  token?: string
  username: string
  password: string
}
