import 'reflect-metadata'
import dotenv from 'dotenv'

import { main } from './main'
import container from './container'

dotenv.config()

main().catch((err) => {
  const logger: any = container.resolve('logger')
  logger.error(err)
})
