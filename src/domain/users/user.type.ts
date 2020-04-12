import { ObjectType, Field } from 'type-graphql'

@ObjectType()
export default class User {
  @Field()
  name: string

  @Field()
  username: string

  @Field()
  password?: string

  @Field()
  token: string
}

export interface IUser {
  name: string;
  token: string;
  username: string
  password?: string
}