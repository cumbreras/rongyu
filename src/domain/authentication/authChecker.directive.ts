const authChecker = ({ context }) => {
  const currentUser: any = context.container.resolve('currentUser')
  const logger: any = context.container.resolve('logger')

  if (currentUser) {
    logger.info(`currentUser @ authChecker: ${currentUser.username}`)
  }

  if (!currentUser) {
    return false
  }

  return true
}

export default authChecker
