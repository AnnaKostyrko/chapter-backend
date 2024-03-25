import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MaxLength } from 'class-validator';
import { passMessage, passwordRegexp } from 'src/helpers/regex/password-regex';

export class UpdatePasswordDto {
  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1111111' })
  @MaxLength(30)
  @Matches(passwordRegexp, {
    message: passMessage,
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: '1111111' })
  @MaxLength(30)
  @Matches(passwordRegexp, {
    message: passMessage,
  })
  @IsNotEmpty()
  repeatNewPassword: string;
}
