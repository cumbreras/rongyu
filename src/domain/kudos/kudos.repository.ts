import { IUser } from '../users/user.type'
import { IKudos } from '../kudos/kudos.type'
import { AppContainer } from '../interfaces/appcontainer.interface'

export default class KudosRepository {
  database: { users: IUser[], kudos: IKudos[] }

  constructor(container: AppContainer) {
    this.database = container.database
  }

  get(): IKudos[] {
    return this.database.kudos
  }

  sentByUser(username: string): IKudos[] {
    return this.database.kudos.filter((k: IKudos) => k.userFrom.username === username);
  }

  receivedByUser(username: string): IKudos[] {
    return this.database.kudos.filter((k: IKudos) => k.userTo.username === username);
  }

  save(message: string, usernameTo: string, usernameFrom: string): IKudos {
    const newKudos = {
      message,
      date: new Date().toLocaleDateString('es-ES'),
      userFrom: {
        username: usernameFrom,
      },
      userTo: {
        username: usernameTo,
      },
    };
    this.database.kudos.push(newKudos);
    return newKudos;
  }
}
