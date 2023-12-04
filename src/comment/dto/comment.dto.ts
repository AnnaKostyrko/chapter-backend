import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Text of the comment',
    example: 'Great post!',
    minLength: 1,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Comment text should not be empty' })
  @Length(1, 255, {
    message: 'Comment text should be between 1 and 255 characters',
  })
  text: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Text of the comment to be updated',
    example: 'This is an updated comment text.',
  })
  @IsNotEmpty()
  @Length(1, 255)
  text: string;
}
export class GetCommentsDto {
  
  @IsNotEmpty({ message: 'Comment text should not be empty' })
  text: any;
}
