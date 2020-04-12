import { ObjectType, Field } from 'type-graphql'
import { IUser } from '../users/user.type'

@ObjectType()
export default class Kudos {
  @Field()
  message: string

  @Field()
  date: string

  @Field()
  userTo: string

  @Field()
  userFrom: string
}

export interface IKudos {
  message: string
  date: string
  userTo: Partial<IUser>
  userFrom: Partial<IUser>
}
