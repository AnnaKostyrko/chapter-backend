import { IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
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
