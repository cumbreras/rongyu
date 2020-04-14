import { IKudos } from '../kudos/kudos.type'
import { IContainer } from '../../container'

export default class KudosRepository {
  private prisma: any
  private logger: any

  constructor(container: IContainer) {
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
    userSent: string,
    userReceived: string
  ): Promise<IKudos> {
    const newKudos = {
      message,
      date: new Date().toLocaleDateString('es-ES'),
      userSent: {
        connect: { username: userSent },
      },
      userReceived: {
        connect: { username: userReceived },
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
