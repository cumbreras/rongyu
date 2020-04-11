const { ApolloServer, gql } = require('apollo-server');
const logger = require('pino')();
const awilix = require('awilix');
const db = require('./db.json');
const kudosRepository = require('./repositories/kudos');
const usersRepository = require('./repositories/users');
const AuthenticationDirective = require('./authDirective');
require('dotenv').config();

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

// TODO: Containerise the resolvers
const resolvers = {
  Query: {
    kudos: (parent, args, ctx) =>
      ctx.container.resolve('kudosRepository').get(),
    kudosSentByUser: (parent, args, ctx) =>
      ctx.container.resolve('kudosRepository').sentByUser(args.username),
    kudosReceivedByUser: (parent, args, ctx) =>
      ctx.container.resolve('kudosRepository').receivedByUser(args.username),
    users: (parent, args, ctx) =>
      ctx.container.resolve('usersRepository').get(),
  },
  Mutation: {
    sendKudos: (_, { input: { message, username: usernameTo } }, ctx) =>
      ctx.container
        .resolve('kudosRepository')
        .save(
          message,
          usernameTo,
          ctx.container.resolve('currentUser').username,
        ),
    registerUser: (_, { input: { username, name, password } }, ctx) =>
      ctx.container
        .resolve('usersRepository')
        .register(name, username, password),
    loginUser: (_, { input: { username, password } }) =>
      ctx.container.resolve('usersRepository').login(username, password),
  },
};

// TODO: Scaffolding should happen in some other place
const container = awilix.createContainer();
container.register({
  kudosRepository: awilix.asClass(kudosRepository),
  usersRepository: awilix.asClass(usersRepository),
  db: awilix.asValue(db),
  appSecret: awilix.asValue(process.env.APP_SECRET),
  logger: awilix.asValue(logger),
});

// TODO: Context should be part of the containerisation
const context = ({ req }) => {
  const authorizationHeader = req.headers.authorization || '';
  const token = extractBearer(authorizationHeader);

  container.register({
    currentToken: awilix.asValue(token),
  });

  return { container };
};

// TODO: Move to helpers
function extractBearer(authorizationHeader) {
  return authorizationHeader.split(' ')[1];
}

// TODO: Extract and decouple for testing
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context,
  schemaDirectives: {
    auth: AuthenticationDirective,
  },
});

server.listen().then(({ url }) => {
  console.log(`Server running at ${url}`);
});
