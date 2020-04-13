import {
  Query,
  Resolver,
  Mutation,
  Ctx,
  InputType,
  Field,
  Arg,
  Authorized,
} from 'type-graphql'
import User from './user.type'
import UsersRepository from './users.repository'
import { IContext } from '../../context'

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
  users(@Ctx() ctx: IContext) {
    return ctx.container.resolve<UsersRepository>('usersRepository').getAll()
  }

  @Mutation(() => User)
  registerUser(
    @Arg('input') { name, username, password }: RegisterUserInput,
    @Ctx() ctx: IContext
  ) {
    return ctx.container
      .resolve<UsersRepository>('usersRepository')
      .register(name, username, password)
  }

  @Mutation(() => User)
  loginUser(
    @Arg('input') { username, password }: LoginUserInput,
    @Ctx() ctx: IContext
  ) {
    return ctx.container
      .resolve<UsersRepository>('usersRepository')
      .login(username, password)
  }
}
