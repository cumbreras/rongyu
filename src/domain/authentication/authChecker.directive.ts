import { AuthChecker } from 'type-graphql'
import Context from '../interfaces/context.interface'

export const authChecker: AuthChecker<Context> = ({
  context: { container },
}): boolean => {
  const currentUser: any = container.resolve('currentUser')
  const logger: any = container.resolve('logger')
  logger.info(`currentUser @ authChecker: ${currentUser}`)

  if (!currentUser) {
    return false
  }

  return true
}
