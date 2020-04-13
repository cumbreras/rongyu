import { buildSchema } from 'type-graphql'
import authChecker from './domain/authentication/authChecker.directive'
import { IContainer } from './container'
import { AwilixContainer } from 'awilix'

interface Options {
  container: AwilixContainer<IContainer>
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
