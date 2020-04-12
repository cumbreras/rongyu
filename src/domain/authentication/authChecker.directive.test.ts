import { authChecker } from './authChecker.directive'
import * as awilix from 'awilix'
import { asValue, AwilixContainer } from 'awilix'

describe('auth directive', () => {
  let container: AwilixContainer

  beforeEach(() => {
    container = awilix.createContainer()
    container.register({
      logger: asValue({
        info: jest.fn(() => true),
      }),
    })
  })

  test('should allow access to the decorated resolver', () => {
    container.register({
      currentUser: asValue({ username: 'mike' }),
    })

    const authCheckerContext = {
      context: { container },
    }

    expect(authChecker(authCheckerContext)).toBeTruthy()
  })

  test('should not allow access when there is no user already validated', () => {
    container.register({
      currentUser: asValue(null),
    })

    const authCheckerContext = {
      context: { container },
    }

    expect(authChecker(authCheckerContext)).toBeFalsy()
  })
})
