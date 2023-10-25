import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, MinLength } from 'class-validator';

export class NicknameValidation {

  @ApiProperty({ example: '@Jojo2323' })
  @IsNotEmpty()
  @MinLength(3)
  nickName: string;

}
