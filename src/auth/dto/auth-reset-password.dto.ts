import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';
import { passwordRegexp } from 'src/helpers/regex/password-regex';

export class AuthResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @Matches(passwordRegexp, {
    message: 'Password must contain min 1 digit, min 1 uppercase letter.',
  })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
