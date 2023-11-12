import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John' })
  @IsOptional()
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  lastName?: string;

  @ApiProperty({ example: '@innekto' })
  @IsOptional()
  nickName?: string;

  @ApiProperty({ example: 'Ukraine, Kyiv' })
  @IsOptional()
  location?: string | null;

  @ApiProperty({ example: 'http//.....' })
  @IsOptional()
  avatarUrl?: string;

  @ApiProperty({ example: 'http//.....' })
  @IsOptional()
  userStatus?: string;
}
