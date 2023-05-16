import { ArgsType, Field } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';

@ArgsType()
export class SignUpArgs {
  @IsEmail()
  @MaxLength(120)
  @Transform((params) => params?.value?.trim())
  @Field()
  email: string;

  @MinLength(6)
  @MaxLength(128)
  @Matches(/^(?!.*[\s])(?=.*\d)(?=.*[A-Z]).*$/, {
    message:
      'password must contain at least 1 number and 1 upper case letter, no whitespaces allowed',
  })
  @Transform((params) => params?.value?.trim())
  @Field()
  password: string;
}