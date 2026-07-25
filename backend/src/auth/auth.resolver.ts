import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './entities/auth-payload.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayload)
  login(@Args('email') email: string, @Args('password') password: string) {
    return this.auth.login(email, password);
  }
}
