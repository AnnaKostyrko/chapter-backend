import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty()
  parentId?: number;

  @ApiProperty()
  @IsNotEmpty()
  @Length(1, 255)
  text: string;

  @ApiProperty()
  postId: number;

  @ApiProperty()
  userId: number;
}
