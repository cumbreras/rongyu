import { IUser } from '../users/user.type'
import { IKudos } from '../kudos/kudos.type'
import { AppContainer } from '../interfaces/appContainer.interface'

export default class KudosRepository {
  private database: { users: IUser[]; kudos: IKudos[] }
  private prisma: any
  private logger: any

  constructor(container: AppContainer) {
    this.database = container.database
    this.prisma = container.prisma
    this.logger = container.logger
  }

  async getAll(): Promise<IKudos[]> {
    return await this.prisma.kudos.findMany()
  }

  async sentByUser(username: string): Promise<IKudos[]> {
    return await this.prisma.kudos.findMany({
      where: { userSent: { username } },
    })
  }

  async receivedByUser(username: string): Promise<IKudos[]> {
    return await this.prisma.kudos.findMany({
      where: { userReceived: { username } },
    })
  }

  async save(
    message: string,
    usernameTo: string,
    usernameFrom: string
  ): Promise<IKudos> {
    const newKudos = {
      message,
      date: new Date().toLocaleDateString('es-ES'),
      userSent: {
        connect: { username: usernameTo },
      },
      userReceived: {
        connect: { username: usernameFrom },
      },
    }

    let kudos: IKudos
    try {
      kudos = await this.prisma.kudos.create({
        data: newKudos,
        include: { userSent: true, userReceived: true },
      })
    } catch (err) {
      this.logger.error(err)
    }

    return kudos
  }
}
