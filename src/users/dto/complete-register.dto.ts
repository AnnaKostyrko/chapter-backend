import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, Matches, MinLength, Validate } from 'class-validator';

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
  @Matches(/^(?=.*\d)(?=.*[A-Z])[A-Za-z\d]+$/, {
    message: 'Password must contain min 1 digit, min 1 uppercase letter and only Latin alphabet.'
   })
  @ApiProperty({example: 'string'})
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  confirmPassword: string;
}
