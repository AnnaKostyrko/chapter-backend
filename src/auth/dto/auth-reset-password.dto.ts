import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { passwordRegexp } from 'src/helpers/regex/password-regex';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(passwordRegexp, {
    message:
      'Password must contain one capital letter and one number, also password should be only Latin letters',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
