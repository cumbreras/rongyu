import { gql } from 'apollo-server'

export default gql`
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
