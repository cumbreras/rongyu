import faker from 'faker'

export const userFactory = () => {
  return {
    id: faker.random.uuid(),
    name: faker.name.findName(),
    username: faker.hacker.noun(),
    password: faker.internet.password(),
  }
}

export const kudosFactory = (
  userSent = userFactory(),
  userReceived = userFactory()
) => {
  return {
    message: faker.lorem.words(4),
    date: faker.date.recent().toISOString(),
    userSent,
    userReceived,
  }
}
