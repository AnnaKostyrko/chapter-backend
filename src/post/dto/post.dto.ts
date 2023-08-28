import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly imageUrl: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly caption: string;
}
