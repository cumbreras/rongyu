import { AwilixContainer } from 'awilix'
import { IUser } from '../users/user.type'

export default interface Context {
  requestId: number
  container: AwilixContainer
}
