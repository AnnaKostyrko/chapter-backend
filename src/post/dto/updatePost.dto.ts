import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly imageUrl?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly caption?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly title?: string;
}
