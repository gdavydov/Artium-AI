import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthenticatedUser } from '../../auth/jwt.strategy';

/** Reads the JWT-authenticated caller off the GraphQL request — populated
 *  by JwtStrategy.validate() via JwtAuthGuard. Only usable on a resolver
 *  method that also carries @UseGuards(JwtAuthGuard). */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const ctx = GqlExecutionContext.create(context);
  return ctx.getContext().req.user;
});
