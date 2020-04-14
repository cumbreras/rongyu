import { IUser } from '../../../domain/users/user.type'
import { userFactory } from '../factories'

export const authedUserRepositoryMock = (
  fakeUserSent: IUser = userFactory()
) => {
  const prismaFindOneUsersMock = jest.fn().mockResolvedValue(fakeUserSent)
  class UsersRepositoryMock {
    async getWithToken(token: string): Promise<IUser> {
      return prismaFindOneUsersMock(token)
    }
  }

  return {
    prismaFindOneUsersMock,
    UsersRepositoryMock,
  }
}
