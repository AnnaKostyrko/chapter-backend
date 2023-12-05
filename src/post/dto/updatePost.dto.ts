import { ApiProperty } from '@nestjs/swagger';

import { IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional()
  @ApiProperty()
  readonly imageUrl?: string;

  @IsOptional()
  @ApiProperty()
  readonly caption?: string;

  @IsOptional()
  @ApiProperty()
  readonly title?: string;
}
