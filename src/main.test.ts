import 'reflect-metadata'
import * as awilix from 'awilix'
import { asValue, AwilixContainer, asClass, asFunction } from 'awilix'
import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'

import faker from 'faker'
import typeDefs from './typedefs'
import context from './context'

import { buildSchema } from 'type-graphql'
import KudosResolver from './domain/kudos/kudos.resolvers'
import UsersResolver from './domain/users/users.resolvers'
import authChecker from './domain/authentication/authChecker.directive'
import { IUser } from './domain/users/user.type'

describe('main', () => {
  let container: AwilixContainer
  beforeAll(() => {
    container = awilix.createContainer()
    container.register({
      typeDefs: asValue(typeDefs),
      logger: asValue({
        // tslint:disable-next-line: no-console
        info: jest.fn((val) => console.log(val)),
      }),
    })
  })

  test('get all users', async () => {
    const GET_USERS = `
      query users {
        users {
          username
        }
      }
    `

    const fakeUser = {
      id: faker.random.uuid(),
      name: faker.name.findName(),
      username: faker.hacker.noun(),
      password: faker.internet.password(),
    }

    const prismaFindManyUsersMock = jest.fn().mockResolvedValue([fakeUser])
    const prismaFindOneUsersMock = jest.fn().mockResolvedValue(fakeUser)
    const bearerMock = faker.random.uuid()

    class UsersRepositoryMock {
      async getAll(): Promise<IUser[]> {
        return prismaFindManyUsersMock()
      }
      async getWithToken(token: string): Promise<IUser> {
        return prismaFindOneUsersMock(token)
      }
    }

    container.register({
      kudosResolver: asClass(KudosResolver),
      usersResolver: asClass(UsersResolver),
      usersRepository: asClass(UsersRepositoryMock),
      prisma: asFunction(() => true),
      appSecret: asValue(faker.random.uuid()),
    })

    const schema = await buildSchema({
      resolvers: [
        container.resolve('kudosResolver'),
        container.resolve('usersResolver'),
      ],
      authChecker,
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

    const { query } = createTestClient(server)
    const response = await query({ query: GET_USERS })

    expect(prismaFindManyUsersMock).toHaveBeenCalled()
    expect(prismaFindOneUsersMock).toHaveBeenCalledWith(bearerMock)
    expect(response.data.users[0].username).toBe(fakeUser.username)
  })
})
