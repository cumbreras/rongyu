import { ApolloServer } from 'apollo-server'
import { authChecker } from './domain/authentication/authchecker.directive'
import { buildSchema } from 'type-graphql'
import { contextHandler } from './contextHandler'
import typeDefs from './typedefs'
import { seedDatabase } from '../prisma/seeds.database'
import container from './container'

export const main = async () => {
  const schema = await buildSchema({
    resolvers: [
      container.resolve('kudosResolver'),
      container.resolve('usersResolver'),
    ],
    authChecker,
  })

  const prisma = container.resolve('prisma')
  seedDatabase(true, prisma)

  const logger: any = container.resolve('logger')

  const server = new ApolloServer({
    typeDefs,
    schema,
    context: contextHandler,
  })

  server.listen().then(({ url }) => {
    logger.info(`Server running at ${url}`)
  })

  return container
}
