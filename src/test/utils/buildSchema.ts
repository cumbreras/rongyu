import { buildSchema } from 'type-graphql'
import { AwilixContainer } from 'awilix'
import authChecker from '../../domain/authentication/authChecker.directive'

interface Options {
  container: AwilixContainer
}

export default async ({ container }: Options) => {
  return await buildSchema({
    resolvers: [
      container.resolve('kudosResolver'),
      container.resolve('usersResolver'),
    ],
    authChecker,
  })
}
