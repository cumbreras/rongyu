import 'reflect-metadata'
import { ApolloServer } from 'apollo-server'
import context from './context'
import typeDefs from './typedefs'
import buildSchema from './buildSchema'
import { AwilixContainer } from 'awilix'
import { IContainer } from './container'

export default async (container: AwilixContainer<IContainer>) => {
  const schema = await buildSchema({
    container,
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
