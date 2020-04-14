import context from './context'
import faker from 'faker'
import * as awilix from 'awilix'
import { asClass, asValue } from 'awilix'
import { authedUserRepositoryMock } from './test/utils/mocks/authedUserRepositoryMock'
import { userFactory } from './test/utils/factories'

describe('context', () => {
  test('it should return the container with the correct registrations', async () => {
    const bearerMock = faker.random.uuid()
    const fakeUser = userFactory()

    const {
      prismaFindOneUsersMock,
      UsersRepositoryMock,
    } = authedUserRepositoryMock(fakeUser)

    const logger = {
      info: jest.fn(),
    }
    const container = awilix.createContainer()
    container.register({
      logger: asValue(logger),
      usersRepository: asClass(UsersRepositoryMock),
    })

    const initialContext = {
      req: { headers: { authorization: `Bearer ${bearerMock}` } },
    }

    const returnContext = await context(initialContext, container)

    expect(prismaFindOneUsersMock).toHaveBeenCalledWith(bearerMock)
    expect(returnContext.container.has('currentUser')).toBeTruthy()
  })
})
