import 'reflect-metadata';
import { ApolloServer, gql } from 'apollo-server';
import logger from 'pino';
import dotenv from 'dotenv';
import { buildSchema } from 'type-graphql';
import * as awilix from 'awilix'
import uuidv4 from 'uuid/v4'
import KudosResolver from './domain/kudos/kudos.resolvers'
import KudosRepository from './domain/kudos/kudos.repository';
import UsersRepository from './domain/users/users.repository'
import Database from './persistency/database'
import UsersResolver from './domain/users/users.resolvers';
import { authChecker } from './domain/authentication/authchecker.directive'

dotenv.config();

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
`;

const container = awilix.createContainer()

container.register({
  appSecret: awilix.asValue(process.env.APP_SECRET),
  database: awilix.asValue(Database),
  kudosRepository: awilix.asClass(KudosRepository),
  usersRepository: awilix.asClass(UsersRepository),
  kudosResolver: awilix.asClass(KudosResolver),
  usersResolver: awilix.asClass(UsersResolver),
  logger: awilix.asValue(logger)
})

// TODO: Context should be part of the containerisation
const contextHandler = ({ req }) => {
  const requestId = uuidv4();
  const authorizationHeader = req.headers.authorization || '';
  const token = extractBearer(authorizationHeader);
  const usersRepository: any = container
    .resolve('usersRepository')

  const user = usersRepository
    .getWithToken(token)

  container.register({
    currentUser: awilix.asValue(user),
    currentUserToken: awilix.asValue(token),
    requestId: awilix.asValue(requestId)
  })

  return { container };
};

// TODO: Move to helpers
function extractBearer(authorizationHeader: string): string {
  return authorizationHeader.split(' ')[1];
}

// TODO: Extract and decouple for testing
const main = async () => {
  const schema = await buildSchema({
    resolvers: [container.resolve('kudosResolver'), container.resolve('usersResolver')],
    authChecker
  })

  const server = new ApolloServer({
    typeDefs,
    schema,
    context: contextHandler,
  })

  server.listen().then(({ url }) => {
    // tslint:disable-next-line: no-console
    console.log(`Server running at ${url}`);
  });
}

// tslint:disable-next-line: no-console
main().catch(err => console.error(err))