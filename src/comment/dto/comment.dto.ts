import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
export class UpdateCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 255)
  text: string;
}
