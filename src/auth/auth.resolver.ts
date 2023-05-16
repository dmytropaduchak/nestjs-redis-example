import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from '../types/user';
import { Token } from '../types/token';
import { SignInArgs } from '../args/sign-in.args';
import { SignUpArgs } from '../args/sign-up.args';
import { AuthService } from './auth.service';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => User)
  async signUp(@Args() args: SignUpArgs) {
    const { email, password } = args;
    return this.authService.signUp(email, password);
  }

  @Mutation(() => Token)
  async signIn(@Args() args: SignInArgs) {
    const { email, password } = args;
    return this.authService.signIn(email, password);
  }
}
