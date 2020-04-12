import jwt from 'jsonwebtoken'
import { AppContainer } from '../interfaces/appContainer.interface'
import { IUser } from './user.type'

export default class UsersRepository {
  private appSecret: string
  private prisma: any
  logger: any

  constructor(container: AppContainer) {
    this.prisma = container.prisma
    this.appSecret = container.appSecret
    this.logger = container.logger
  }

  async getAll(): Promise<IUser[]> {
    return await this.prisma.user.findMany()
  }

  async getByUsername(username: string): Promise<IUser> {
    return await this.prisma.user.findOne({
      where: { username },
    })
  }

  async register(
    name: string,
    username: string,
    password: string
  ): Promise<IUser> {
    const token = jwt.sign({ username, password }, this.appSecret)

    const newUser = {
      name,
      username,
      password,
      token,
    }

    let user: IUser

    try {
      user = await this.prisma.user.create({ data: newUser })
    } catch (e) {
      throw new Error(`User already registered`)
    }

    this.logger.info(`New User Registered: ${newUser.username}`)
    return user
  }

  async login(username: string, password: string): Promise<IUser> {
    let user = await this.getByUsername(username)

    if (!this.isSamePassword(password, user.password) || !user) {
      this.logger.error(`User couldn't login`)
      throw new Error('User not found')
    }

    const token = jwt.sign(
      { username: user.username, password: user.password },
      this.appSecret
    )

    user = await this.prisma.user.update({
      where: { id: user.id },
      data: { token },
    })

    return user
  }

  async getWithToken(token: string): Promise<IUser> {
    try {
      const decoded = jwt.verify(token, this.appSecret)
      return await this.getByUsername((decoded as IUser).username)
    } catch (e) {
      return null
    }
  }

  private isSamePassword(
    passwordAttempt: string,
    currentPassword: string
  ): boolean {
    // dummy implementation for now
    return passwordAttempt === currentPassword
  }
}
