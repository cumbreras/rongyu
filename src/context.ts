import { asValue } from 'awilix'
import uuidv4 from 'uuid/v4'
import { extractBearer } from './helpers/extractBearer'

export default async ({ req }, container) => {
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
