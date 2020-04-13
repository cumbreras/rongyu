import * as awilix from 'awilix'
import { asClass, asValue, asFunction, AwilixContainer } from 'awilix'
import { PrismaClient } from '@prisma/client'
import pino, { Logger } from 'pino'

import KudosResolver from './domain/kudos/kudos.resolvers'
import KudosRepository from './domain/kudos/kudos.repository'
import UsersRepository from './domain/users/users.repository'
import UsersResolver from './domain/users/users.resolvers'
import typeDefs from './typedefs'
import { DocumentNode } from 'graphql'
import { IUser } from './domain/users/user.type'

const prisma = new PrismaClient()
const logger = pino()
const container = awilix.createContainer()

container.register({
  appSecret: asValue(process.env.APP_SECRET),
  kudosRepository: asClass(KudosRepository),
  usersRepository: asClass(UsersRepository),
  kudosResolver: asClass(KudosResolver),
  usersResolver: asClass(UsersResolver),
  logger: asValue(logger),
  prisma: asValue(prisma),
  typeDefs: asValue(typeDefs),
  currentUser: asValue({}),
})

export interface IContainer extends AwilixContainer {
  prisma: any
  kudosRepository: KudosRepository
  usersRepository: object
  kudosResolver: KudosResolver
  usersResolver: UsersResolver
  logger: Logger
  typeDefs: DocumentNode
  appSecret?: string
  currentUser?: IUser
  requestId?: string
}

export default container as IContainer
