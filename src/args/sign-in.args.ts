import { ArgsType } from '@nestjs/graphql';
import { SignUpArgs } from './sign-up.args';

@ArgsType()
export class SignInArgs extends SignUpArgs {}
