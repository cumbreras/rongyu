import { asValue, AwilixContainer } from 'awilix'
import uuidv4 from 'uuid/v4'

import { extractBearer } from './helpers/extractBearer'
import { IContainer } from './container'
import { IUser } from './domain/users/user.type'

export default async ({ req }, container: AwilixContainer<IContainer>) => {
  const requestId = uuidv4()
  const authorizationHeader = req.headers.authorization || ''
  const token = extractBearer(authorizationHeader)

  const usersRepository: any = container.resolve('usersRepository')
  const user = await usersRepository.getWithToken(token)
  const logger: any = container.resolve('logger')
  logger.info(`user: ${user}`)

  if (user) {
    logger.info(`User received by headers: ${user.username}`)
  }

  container.register({
    currentUser: asValue(user),
    requestId: asValue(requestId),
  })

  return { container }
}

export interface IContext {
  requestId: number
  container: AwilixContainer<IContainer>
  currentUser?: IUser
}
