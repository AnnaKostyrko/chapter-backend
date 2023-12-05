import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
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
