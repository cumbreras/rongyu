import jwt from 'jsonwebtoken'
import { IDatabase } from '../interfaces/database.interface'
import { AppContainer } from '../interfaces/appcontainer.interface'
import { IUser } from './user.type'

export default class UsersRepository {
  private appSecret: string
  private database: IDatabase

  constructor(container: AppContainer) {
    this.database = container.database
    this.appSecret = container.appSecret
  }

  get() {
    return this.database.users
  }

  register(name: string, username: string, password: string): IUser {
    const token = jwt.sign(
      { username, password },
      this.appSecret,
    );

    const newUser = {
      name,
      username,
      password,
      token,
    };

    this.database.users.push(newUser);
    return newUser;
  }

  login(username: string, password: string): IUser {
    const user = this.database.users.find(
      (userData) => userData.username === username && userData.password === password,
    )

    if (!user) {
      throw new Error('User not found')
    }

    const token = jwt.sign(
      { username: user.username, password: user.password },
      this.appSecret,
    )

    user.token = token
    return user
  }

  getWithToken(token: string): IUser | null {
    try {
      const decoded = jwt.verify(token, this.appSecret);
      const user = this.database.users.find(
        (userData) => {
          return userData.username === (decoded as IUser).username &&
            userData.password === (decoded as IUser).password
        }
      );

      return user;
    } catch (e) {
      return null;
    }
  }
}
