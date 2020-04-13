import dotenv from 'dotenv'
dotenv.config()

import 'reflect-metadata'
import main from './main'
import container from './container'

main(container).catch((err) => {
  const logger: any = container.resolve('logger')
  logger.error(err)
})
