import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class PostDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @IsOptional()
  @IsString()
  readonly author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  readonly categories?: string[];

  @IsOptional()
  @IsDate()
  readonly createdDate?: Date;

  @IsOptional()
  @IsString()
  readonly imageUrl?: string;
}
