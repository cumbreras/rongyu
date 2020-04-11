const { SchemaDirectiveVisitor } = require('apollo-server');
const awilix = require('awilix');
const usersRepository = require('./repositories/users');

class AuthenticationDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field, details) {
    const { resolve = defaultFieldResolver } = field;

    field.resolve = async function (...args) {
      const [, , ctx] = args;
      const logger = ctx.container.resolve('logger');
      logger.info('users', ctx.container.resolve('db').users);

      const user = ctx.container
        .resolve('usersRepository')
        .getWithToken(ctx.container.resolve('currentToken'));

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

module.exports = AuthenticationDirective;
