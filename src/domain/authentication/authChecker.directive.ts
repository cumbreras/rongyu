export const authChecker = ({ context }) => {
  const currentUser: any = context.container.resolve('currentUser')
  const logger: any = context.container.resolve('logger')
  logger.info(`currentUser @ authChecker: ${currentUser}`)

  if (!currentUser) {
    return false
  }

  return true
}
