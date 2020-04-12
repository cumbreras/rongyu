import { ObjectType, Field } from 'type-graphql'
import User, { IUser } from '../users/user.type'

@ObjectType()
export default class Kudos {
  @Field()
  message: string

  @Field()
  date: string

  @Field()
  userSent: User

  @Field()
  userReceived: User
}

export interface IKudos {
  message: string
  date: string
  userTo: Partial<IUser>
  userFrom: Partial<IUser>
}
