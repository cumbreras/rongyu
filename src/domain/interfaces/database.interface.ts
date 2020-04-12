import { IUser } from '../users/user.type'
import { IKudos } from '../kudos/kudos.type'

export interface IDatabase {
  users: IUser[];
  kudos: IKudos[];
}
