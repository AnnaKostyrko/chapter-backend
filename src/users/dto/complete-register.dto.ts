import { ApiProperty } from '@nestjs/swagger';

import { MinLength, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class UpdateUserRegisterDto {

  @ApiProperty({ example: '@Jojo2323' })

  @Validate(IsNotExist, ['User'], {
    message: 'nickNameAlreadyExists',
  })

  @MinLength(3)
  nickName: string;

  @ApiProperty({example: 'string'})
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  lastName?: string;
}


