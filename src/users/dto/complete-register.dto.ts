import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, MinLength, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class UpdateUserRegisterDto {
  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '@Jojo2323' })
  @IsNotEmpty()
  @MinLength(3)
  nickName: string;

  @IsNotEmpty()
  @ApiProperty({example: 'string'})
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(6)
  confirmPassword: string;
}
