import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  readonly caption: string;
}
