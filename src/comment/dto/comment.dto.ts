import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
export class UpdateCommentDto {
  @ApiProperty({
    description: 'Text of the comment to be updated',
    example: 'This is an updated comment text.',
  })
  @IsNotEmpty()
  @Length(1, 255)
  text: string;
}
