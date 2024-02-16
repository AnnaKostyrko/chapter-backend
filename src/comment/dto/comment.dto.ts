import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches } from 'class-validator';
import { commentRegexp } from 'src/helpers/regex/comment.regexp';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Text of the comment',
    example: 'Great post!',
    minLength: 1,
    maxLength: 500,
  })
  @Matches(commentRegexp, {
    message: 'incorrect format',
  })
  @IsNotEmpty({ message: 'Comment text should not be empty' })
  @Length(1, 500, {
    message: 'Comment text should be between 1 and 500 characters',
  })
  text: string;
}

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Text of the comment to be updated',
    example: 'This is an updated comment text.',
  })
  @IsNotEmpty()
  @Matches(commentRegexp, {
    message: 'incorrect format',
  })
  @Length(1, 500)
  text: string;
}
export class GetCommentsDto {
  @IsNotEmpty({ message: 'Comment text should not be empty' })
  text: any;
}
