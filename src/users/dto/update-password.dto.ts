import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  newPassword: string;

  @ApiProperty({ example: '1111111' })
  @IsNotEmpty()
  repeatNewPassword: string;
}
