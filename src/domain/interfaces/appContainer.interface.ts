import { AwilixContainer } from 'awilix'
import KudosRepository from '../kudos/kudos.repository'
import KudosResolver from '../kudos/kudos.resolvers'
import UsersResolver from '../users/users.resolvers'
import UsersRepository from '../users/users.repository'
import { Logger } from 'pino'

export interface AppContainer extends AwilixContainer {
  prisma: any
  appSecret: string
  kudosRepository: KudosRepository
  usersRepository: UsersRepository
  kudosResolver: KudosResolver
  usersResolver: UsersResolver
  logger: Logger
}
