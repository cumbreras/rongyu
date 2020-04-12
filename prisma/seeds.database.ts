import { IUser } from '../src/domain/users/user.type'

const seeds = {
  kudos: [
    {
      message: 'because he is cool',
      date: '04/10/2020',
      userFrom: { username: 'bayito' },
      userTo: { username: 'mplatinas' },
    },
    {
      message: 'because he rocks',
      date: '04/10/2020',
      userTo: { username: 'bayito' },
      userFrom: { username: 'mplatinas' },
    },
  ],
  users: [
    {
      username: 'bayito',
      name: 'Chimo Bayo',
      password: 'chimo',
    },
    {
      username: 'mplatinas',
      name: 'Mike Platinas',
      password: 'mike',
    },
  ],
}

export function seedDatabase(skip: boolean, prisma) {
  if (skip) return

  try {
    seeds.users.forEach(async (user: IUser) => {
      await prisma.user.create({
        data: user,
      })
    })
  } catch (err) {
    logger.error(`Error seeding database: ${err}`)
  }
}
