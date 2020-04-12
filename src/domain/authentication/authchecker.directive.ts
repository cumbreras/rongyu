import { AuthChecker } from 'type-graphql';
import Context from '../interfaces/context.interface';

export const authChecker: AuthChecker<Context> = ({ context: { currentUser } }): boolean => {
  if (!currentUser) {
    return false;
  }
  return true;
};