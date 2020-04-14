import 'reflect-metadata'
import faker from 'faker'
import * as awilix from 'awilix'
import { asClass, AwilixContainer } from 'awilix'

import KudosResolver from './domain/kudos/kudos.resolvers'
import UsersResolver from './domain/users/users.resolvers'
import { IUser } from './domain/users/user.type'
import testServer from './test/utils/testServer'
import { IContainer } from './container'
import { userFactory, kudosFactory } from './test/utils/factories'
import { IKudos } from './domain/kudos/kudos.type'
import { authedUserRepositoryMock } from './test/utils/mocks/authedUserRepositoryMock'
import { KudosByUserInput } from '../src/domain/kudos/kudos.resolvers'

describe('main', () => {
  let bearerMock: string
  let fakeUserReceived: IUser
  let fakeUserSent: IUser
  let fakeKudos: IKudos

  beforeAll(() => {
    bearerMock = faker.random.uuid()
    fakeUserReceived = userFactory()
    fakeUserSent = userFactory()
    fakeKudos = kudosFactory(fakeUserSent, fakeUserReceived)
  })

  describe('user resolver', () => {
    test('get all users', async () => {
      const GET_USERS = `
      query users {
        users {
          username
        }
      }
    `

      const prismaFindManyUsersMock = jest
        .fn()
        .mockResolvedValue([fakeUserReceived, fakeUserSent])
      const prismaFindOneUsersMock = jest.fn().mockResolvedValue(fakeUserSent)

      class UsersRepositoryMock {
        async getAll(): Promise<IUser[]> {
          return prismaFindManyUsersMock()
        }
        async getWithToken(token: string): Promise<IUser> {
          return prismaFindOneUsersMock(token)
        }
      }

      const container = awilix.createContainer()
      container.register({
        kudosResolver: asClass(KudosResolver),
        usersResolver: asClass(UsersResolver),
        usersRepository: asClass(UsersRepositoryMock),
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
      expect(response.data.users[0].username).toBe(fakeUserReceived.username)
      expect(response.data.users[1].username).toBe(fakeUserSent.username)
    })
  })

  describe('kudos resolver', () => {
    test('get all kudos', async () => {
      const GET_KUDOS = `
      query kudos {
        kudos {
          message
        }
      }
    `

      const prismaFindManyKudosMock = jest.fn().mockResolvedValue([fakeKudos])

      // tslint:disable-next-line: max-classes-per-file
      class KudosRepositoryMock {
        async getAll(): Promise<IUser[]> {
          return prismaFindManyKudosMock()
        }
      }

      const {
        prismaFindOneUsersMock,
        UsersRepositoryMock,
      } = authedUserRepositoryMock(fakeUserSent)

      const container = awilix.createContainer()
      container.register({
        kudosResolver: asClass(KudosResolver),
        usersResolver: asClass(UsersResolver),
        usersRepository: asClass(UsersRepositoryMock),
        kudosRepository: asClass(KudosRepositoryMock),
      })

      const testValues: {
        bearerMock: string
        container: AwilixContainer<IContainer>
      } = {
        bearerMock,
        container,
      }

      const { query } = await testServer(testValues)
      const response = await query({ query: GET_KUDOS })

      expect(prismaFindManyKudosMock).toHaveBeenCalled()
      expect(prismaFindOneUsersMock).toHaveBeenCalledWith(bearerMock)
      expect(response.data.kudos[0].message).toBe(fakeKudos.message)
    })

    test('send kudos', async () => {
      const SEND_KUDOS = `
      mutation sendKudos($input: SendKudosInput!) {
        sendKudos(input: $input) {
          message
          userSent {
            username
          }
          userReceived {
            username
          }
        }
      }
    `

      const prismaCreateKudosMock = jest.fn().mockResolvedValue(fakeKudos)

      // tslint:disable-next-line: max-classes-per-file
      class KudosRepositoryMock {
        async save(
          message: string,
          userSent: string,
          userReceived: string
        ): Promise<IUser[]> {
          return prismaCreateKudosMock(message, userSent, userReceived)
        }
      }

      const {
        prismaFindOneUsersMock,
        UsersRepositoryMock,
      } = authedUserRepositoryMock(fakeUserSent)

      const container = awilix.createContainer()
      container.register({
        kudosResolver: asClass(KudosResolver),
        usersResolver: asClass(UsersResolver),
        usersRepository: asClass(UsersRepositoryMock),
        kudosRepository: asClass(KudosRepositoryMock),
      })

      const testValues: {
        bearerMock: string
        container: AwilixContainer<IContainer>
      } = {
        bearerMock,
        container,
      }

      const sendKudosPayload: {
        input: {
          message: string
          userReceivedUsername: string
        }
      } = {
        input: {
          message: faker.random.words(4),
          userReceivedUsername: fakeUserReceived.username,
        },
      }

      const { mutate } = await testServer(testValues)

      const {
        data: { sendKudos: sendKudosResponse },
      } = await mutate({
        mutation: SEND_KUDOS,
        variables: sendKudosPayload,
      })

      expect(prismaFindOneUsersMock).toHaveBeenCalledWith(bearerMock)
      expect(prismaCreateKudosMock).toHaveBeenCalledWith(
        sendKudosPayload.input.message,
        sendKudosPayload.input.userReceivedUsername,
        fakeUserSent.username
      )
      expect(sendKudosResponse.message).toBe(fakeKudos.message)
      expect(sendKudosResponse.userReceived.username).toBe(
        fakeUserReceived.username
      )
      expect(sendKudosResponse.userSent.username).toBe(fakeUserSent.username)
    })

    test('get kudos sent by the user', async () => {
      const KUDOS_SENT_BY_USER = `
        query kudosSentByUser($input: KudosByUserInput!) {
          kudosSentByUser(input: $input) {
            message
          }
        }
      `

      const prismaFindManyKudosByUserMock = jest
        .fn()
        .mockResolvedValue([fakeKudos])

      // tslint:disable-next-line: max-classes-per-file
      class KudosRepositoryMock {
        async sentByUser(username: string) {
          return prismaFindManyKudosByUserMock()
        }
      }

      const { UsersRepositoryMock } = authedUserRepositoryMock()
      const container = awilix.createContainer()
      container.register({
        kudosResolver: asClass(KudosResolver),
        usersResolver: asClass(UsersResolver),
        usersRepository: asClass(UsersRepositoryMock),
        kudosRepository: asClass(KudosRepositoryMock),
      })

      const testValues: {
        bearerMock: string
        container: AwilixContainer<IContainer>
      } = {
        bearerMock,
        container,
      }

      const kudosSentByUserArgs: { input: KudosByUserInput } = {
        input: {
          username: fakeKudos.userSent.username,
        },
      }

      const { query } = await testServer(testValues)
      const response = await query({
        query: KUDOS_SENT_BY_USER,
        variables: kudosSentByUserArgs,
      })

      expect(response.data.kudosSentByUser[0].message).toBe(fakeKudos.message)
    })

    test('get kudos received by the user', async () => {
      const KUDOS_RECEIVED_BY_USER = `
        query kudosReceivedByUser($input: KudosByUserInput!) {
          kudosReceivedByUser(input: $input) {
            message
          }
        }
      `

      const prismaFindManyKudosByUserMock = jest
        .fn()
        .mockResolvedValue([fakeKudos])

      // tslint:disable-next-line: max-classes-per-file
      class KudosRepositoryMock {
        async receivedByUser(username: string) {
          return prismaFindManyKudosByUserMock()
        }
      }

      const { UsersRepositoryMock } = authedUserRepositoryMock()
      const container = awilix.createContainer()
      container.register({
        kudosResolver: asClass(KudosResolver),
        usersResolver: asClass(UsersResolver),
        usersRepository: asClass(UsersRepositoryMock),
        kudosRepository: asClass(KudosRepositoryMock),
      })

      const testValues: {
        bearerMock: string
        container: AwilixContainer<IContainer>
      } = {
        bearerMock,
        container,
      }

      const kudosReceivedByUserArgs: { input: KudosByUserInput } = {
        input: {
          username: fakeKudos.userSent.username,
        },
      }

      const { query } = await testServer(testValues)
      const response = await query({
        query: KUDOS_RECEIVED_BY_USER,
        variables: kudosReceivedByUserArgs,
      })

      expect(response.data.kudosReceivedByUser[0].message).toBe(
        fakeKudos.message
      )
    })
  })
})
