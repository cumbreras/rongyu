import {
  Query, Resolver, Mutation, Ctx,
  InputType, Field, Arg, Authorized
} from 'type-graphql'
import User from './user.type'
import Context from '../interfaces/context.interface'
import UserRepository from './users.repository'

@InputType({ description: 'Register User' })
export class RegisterUserInput implements Partial<User> {
  @Field()
  username: string

  @Field()
  name: string

  @Field()
  password: string
}

// tslint:disable-next-line: max-classes-per-file
@InputType({ description: 'Login User' })
export class LoginUserInput implements Partial<User> {
  @Field()
  username: string

  @Field()
  password: string
}

// tslint:disable-next-line: max-classes-per-file
@Resolver(User)
export default class UsersResolver {
  @Authorized()
  @Query(() => [User])
  users(@Ctx() ctx: Context) {
    return ctx.container
      .resolve<UserRepository>('usersRepository')
      .get()
  }

  @Mutation(() => User)
  registerUser(
    @Arg('input') { name, username, password }: RegisterUserInput,
    @Ctx() ctx: Context
  ) {
    return ctx.container
      .resolve<UserRepository>('usersRepository')
      .register(name, username, password)
  }

  @Mutation(() => User)
  loginUser(
    @Arg('input') { username, password }: LoginUserInput,
    @Ctx() ctx: Context
  ) {
    return ctx.container
      .resolve<UserRepository>('usersRepository')
      .login(username, password)
  }
}