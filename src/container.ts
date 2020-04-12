import { asClass, asValue } from 'awilix'
import { PrismaClient } from '@prisma/client'
import pino from 'pino'
import * as awilix from 'awilix'

import KudosResolver from './domain/kudos/kudos.resolvers'
import KudosRepository from './domain/kudos/kudos.repository'
import UsersRepository from './domain/users/users.repository'
import UsersResolver from './domain/users/users.resolvers'

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
})

export default container
