import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import { passwordRegexp } from 'src/helpers/regex/password-regex';

export class UpdatePasswordDto {
  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(8)
  @MaxLength(30)
  @Matches(passwordRegexp, {
    message:
      'Password must contain one capital letter and one number, also password should be only Latin letters',
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(8)
  @MaxLength(30)
  @Matches(passwordRegexp, {
    message:
      'Password must contain one capital letter and one number, also password should be only Latin letters',
  })
  @IsNotEmpty()
  repeatNewPassword: string;
}
