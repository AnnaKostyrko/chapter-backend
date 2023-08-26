import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, MinLength } from 'class-validator';

export class UpdateUserRegisterDto {
 

  // @ApiProperty({ example: '@Jojo2323' })
  // @IsOptional()
  // nickName?: string;

  @ApiProperty()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  lastName?: string ;
}
