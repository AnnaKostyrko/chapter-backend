import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, Matches, MinLength, Validate } from 'class-validator';
import { IsNotExist } from 'src/utils/validators/is-not-exists.validator';

export class UpdateUserRegisterDto {

  @ApiProperty({ example: 'Jojo2323' })
  @IsNotEmpty()
  @Validate(IsNotExist, ['User'], {
    message: 'nickNameAlreadyExists',
  })
  @MinLength(3)
  nickName: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;
}


