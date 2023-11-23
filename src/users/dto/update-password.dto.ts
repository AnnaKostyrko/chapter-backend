import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';
import { passwordRegexp } from 'src/helpers/regex/password-regex';

export class UpdatePasswordDto {
  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(8)
  @Matches(passwordRegexp, {
    message: 'Password must contain min 1 digit, min 1 uppercase letter.',
  })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(8)
  @IsNotEmpty()
  repeatNewPassword: string;
}
