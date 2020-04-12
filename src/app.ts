import 'reflect-metadata'
import { ApolloServer, gql } from 'apollo-server'
import pino from 'pino'
import dotenv from 'dotenv'
import { buildSchema } from 'type-graphql'
import * as awilix from 'awilix'
import { asClass, asValue } from 'awilix'
import uuidv4 from 'uuid/v4'
import { PrismaClient } from '@prisma/client'

import KudosResolver from './domain/kudos/kudos.resolvers'
import KudosRepository from './domain/kudos/kudos.repository'
import UsersRepository from './domain/users/users.repository'
import Database from './persistency/database'
import UsersResolver from './domain/users/users.resolvers'
import { authChecker } from './domain/authentication/authchecker.directive'
import { IUser } from './domain/users/user.type'
import { extractBearer } from './helpers/extractBearer'

dotenv.config()
const logger = pino()

const typeDefs = gql`
  directive @auth on FIELD_DEFINITION

  type User {
    username: String
  }

  type Kudos {
    message: String
    date: String
    userTo: User!
    userFrom: User!
  }

  input SendKudosInput {
    username: String!
    message: String!
  }

  input RegisterUserInput {
    name: String!
    username: String!
    password: String!
  }

  type RegisterUserPayload {
    name: String!
    username: String!
    token: String!
  }

  input LoginUserInput {
    username: String!
    password: String!
  }

  type LoginUserPayload {
    username: String!
    token: String!
  }

  type Query {
    kudos: [Kudos!] @auth
    kudosSentByUser(username: String!): [Kudos] @auth
    kudosReceivedByUser(username: String!): [Kudos] @auth
    users: [User!] @auth
  }

  type Mutation {
    sendKudos(input: SendKudosInput): Kudos @auth
    registerUser(input: RegisterUserInput): RegisterUserPayload
    loginUser(input: LoginUserInput): LoginUserPayload
  }
`

const prisma = new PrismaClient()
const container = awilix.createContainer()

container.register({
  appSecret: asValue(process.env.APP_SECRET),
  database: asValue(Database),
  kudosRepository: asClass(KudosRepository),
  usersRepository: asClass(UsersRepository),
  kudosResolver: asClass(KudosResolver),
  usersResolver: asClass(UsersResolver),
  logger: asValue(logger),
  prisma: asValue(prisma),
})

// TODO: Context should be part of the containerisation
const contextHandler = async ({ req }) => {
  const requestId = uuidv4()
  const authorizationHeader = req.headers.authorization || ''
  const token = extractBearer(authorizationHeader)
  const usersRepository: any = container.resolve('usersRepository')

  const user = await usersRepository.getWithToken(token)

  logger.info(`User received by headers: ${user.username}`)

  container.register({
    currentUser: asValue(user),
    currentUserToken: asValue(token),
    requestId: asValue(requestId),
  })

  return { container }
}

// TODO: Extract and decouple for testing
const main = async () => {
  const schema = await buildSchema({
    resolvers: [
      container.resolve('kudosResolver'),
      container.resolve('usersResolver'),
    ],
    authChecker,
  })

  // seedDatabase()

  const server = new ApolloServer({
    typeDefs,
    schema,
    context: contextHandler,
  })

  server.listen().then(({ url }) => {
    logger.info(`Server running at ${url}`)
  })

  return container
}

main().catch((err) => {
  logger.error(err)
})

function seedDatabase() {
  const database: any = container.resolve('database')
  try {
    database.users.forEach(async (user: IUser) => {
      await prisma.user.create({
        data: user,
      })
    })
  } catch (err) {
    logger.error(`Error seeding database: ${err}`)
  }
}
