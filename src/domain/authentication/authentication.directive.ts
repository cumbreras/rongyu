import { SchemaDirectiveVisitor } from 'apollo-server';
import awilix from 'awilix';

export default class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve } = field;

    field.resolve = async function (...args) {
      const [, , ctx] = args;
      const logger = ctx.container.resolve('logger');
      logger.info('users', ctx.container.resolve('db').users);

      const user = ctx.container
        .resolve('usersRepository')
        .getWithToken(ctx.container.resolve('currentToken'));

      console.log('user', user);
      // TODO: currentUser should be containerised if found
      ctx.container.register({
        currentUser: awilix.asValue(user),
      });
      logger.info('found user', user);

      if (!user) {
        logger.error('Unathorized user');
        throw new Error('You are not authorized for this resource');
      }

      return resolve.apply(this, args);
    };
  }
}
