import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
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

  @ValidateIf((value) => !value.imageUrl && !value.caption && !value.title)
  @IsNotEmpty({
    message: 'At least one field (imageUrl, caption, title) must be specified',
  })
  readonly atLeastOneField?: string;
}
