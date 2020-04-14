import { createTestClient } from 'apollo-server-testing'
import faker from 'faker'
import { ApolloServer } from 'apollo-server'
import pino from 'pino'

import buildSchema from '../../buildSchema'
import context from '../../context'
import typeDefs from '../../typedefs'
import { asValue, AwilixContainer } from 'awilix'
import { IContainer } from '../../container'

export default async ({
  bearerMock,
  container,
}: {
  bearerMock: string
  container: AwilixContainer<IContainer>
}) => {
  const logger = pino({ enabled: false })
  container.register({
    appSecret: asValue(faker.random.uuid()),
    typeDefs: asValue(typeDefs),
    logger: asValue(logger),
  })

  const schema = await buildSchema({
    container,
  })

  const server = new ApolloServer({
    typeDefs,
    context: () =>
      context(
        {
          req: { headers: { authorization: `Bearer ${bearerMock}` } },
        },
        container
      ),
    schema,
  })

  const { query, mutate } = createTestClient(server)

  return {
    query,
    mutate,
  }
}
