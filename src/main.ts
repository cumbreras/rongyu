import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import { buildSchema } from 'type-graphql'
import { AppContainer } from './domain/interfaces/appContainer.interface'
import authChecker from './domain/authentication/authChecker.directive'
import context from './context'
import typeDefs from './typedefs'

export default async (container: AppContainer) => {
  const schema = await buildSchema({
    resolvers: [
      container.resolve('kudosResolver'),
      container.resolve('usersResolver'),
    ],
    authChecker,
  })

  const logger: any = container.resolve('logger')

  const server = new ApolloServer({
    typeDefs,
    context: (req) => context(req, container),
    schema,
  })

  server.listen().then(({ url }) => {
    logger.info(`Server running at ${url}`)
  })

  return server
}
