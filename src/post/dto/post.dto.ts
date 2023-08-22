import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly content: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty()
  readonly categories?: string[];

  @IsOptional()
  @IsDate()
  @ApiProperty()
  readonly createdDate?: Date;

  @IsOptional()
  @IsString()
  @ApiProperty()
  readonly imageUrl?: string;
}
