import 'reflect-metadata'
import faker from 'faker'
import * as awilix from 'awilix'
import { asClass, asFunction, AwilixContainer } from 'awilix'

import KudosResolver from './domain/kudos/kudos.resolvers'
import UsersResolver from './domain/users/users.resolvers'
import { IUser } from './domain/users/user.type'
import testServer from './test/utils/testServer'
import { IContainer } from './container'
import KudosRepository from './domain/kudos/kudos.repository'

describe('main', () => {
  let fakeUser: IUser

  beforeAll(() => {
    fakeUser = {
      id: faker.random.uuid(),
      name: faker.name.findName(),
      username: faker.hacker.noun(),
      password: faker.internet.password(),
    }
  })

  test('get all users', async () => {
    const GET_USERS = `
      query users {
        users {
          username
        }
      }
    `

    const prismaFindManyUsersMock = jest.fn().mockResolvedValue([fakeUser])
    const prismaFindOneUsersMock = jest.fn().mockResolvedValue(fakeUser)

    class UsersRepositoryMock {
      async getAll(): Promise<IUser[]> {
        return prismaFindManyUsersMock()
      }
      async getWithToken(token: string): Promise<IUser> {
        return prismaFindOneUsersMock(token)
      }
    }

    const bearerMock = faker.random.uuid()

    const container = awilix.createContainer()
    container.register({
      kudosResolver: asClass(KudosResolver),
      usersResolver: asClass(UsersResolver),
      usersRepository: asClass(UsersRepositoryMock),
      kudosRepository: asClass(KudosRepository),
      prisma: asFunction(() => true),
    })

    const testValues: {
      bearerMock: string
      container: AwilixContainer<IContainer>
    } = {
      bearerMock,
      container,
    }

    const { query } = await testServer(testValues)
    const response = await query({ query: GET_USERS })

    expect(prismaFindManyUsersMock).toHaveBeenCalled()
    expect(prismaFindOneUsersMock).toHaveBeenCalledWith(bearerMock)
    expect(response.data.users[0].username).toBe(fakeUser.username)
  })
})
