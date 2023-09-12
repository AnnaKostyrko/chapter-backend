import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: '1111111' })
  @MinLength(6)
  @IsNotEmpty()
  repeatNewPassword: string;
}
