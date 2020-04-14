import {
  Resolver,
  Query,
  Ctx,
  Args,
  Mutation,
  Arg,
  Field,
  InputType,
  ArgsType,
} from 'type-graphql'
import Kudos from './kudos.type'

@InputType({ description: 'Kudos by User' })
export class KudosByUserInput {
  @Field({ nullable: true })
  username: string
}

// tslint:disable-next-line: max-classes-per-file
@InputType({ description: 'Send Kudos' })
class SendKudosInput implements Partial<Kudos> {
  @Field()
  userReceivedUsername: string

  @Field()
  message: string
}

// tslint:disable-next-line: max-classes-per-file
@Resolver(Kudos)
export default class KudosResolver {
  @Query(() => [Kudos])
  kudos(@Ctx() ctx) {
    return ctx.container.resolve('kudosRepository').getAll()
  }

  @Query(() => [Kudos])
  kudosSentByUser(@Arg('input') { username }: KudosByUserInput, @Ctx() ctx) {
    return ctx.container.resolve('kudosRepository').sentByUser(username)
  }

  @Query(() => [Kudos])
  kudosReceivedByUser(
    @Arg('input') { username }: KudosByUserInput,
    @Ctx() ctx
  ) {
    return ctx.container.resolve('kudosRepository').receivedByUser(username)
  }

  @Mutation(() => Kudos)
  sendKudos(@Arg('input') newKudosInput: SendKudosInput, @Ctx() ctx) {
    return ctx.container
      .resolve('kudosRepository')
      .save(
        newKudosInput.message,
        newKudosInput.userReceivedUsername,
        ctx.container.resolve('currentUser').username
      )
  }
}
