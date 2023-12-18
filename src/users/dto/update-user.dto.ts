import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsOptional, Matches, Validate } from 'class-validator';
import { IsValidName } from 'src/utils/validators/double-names-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @Validate(IsValidName, {
    message: 'Incorrect name',
  })
  @IsNotEmpty()
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @Validate(IsValidName, {
    message: 'Incorrect last name',
  })
  @IsNotEmpty()
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '@Jojo2323' })
  @Matches(/^@[A-Za-z0-9]{7,30}$/, { message: 'Incorrect format of nick name' })
  @IsOptional()
  @IsNotEmpty()
  nickName?: string;

  @ApiProperty({ example: 'Ukraine, Kyiv' })
  @IsNotEmpty()
  @IsOptional()
  location?: string | null;

  @ApiProperty({ example: 'http//.....' })
  @IsNotEmpty()
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'http//.....' })
  @IsNotEmpty()
  @IsOptional()
  userStatus?: string;
}
