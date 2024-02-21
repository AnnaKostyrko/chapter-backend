import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, Length, Matches, ValidateIf } from 'class-validator';
import { commentRegexp } from 'src/helpers/regex/comment.regexp';

export class PostCommentDto {
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

export class CommentToCommentDto extends PartialType(PostCommentDto) {
  @ApiProperty({
    description: 'Text of the comment',
    example: 'Great post/comment!',
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

  @ApiProperty()
  @IsNotEmpty({
    message:
      'Recipient ID should not be empty when recipient nickname is provided',
  })
  @ValidateIf((object) => object.recipientNickName !== undefined)
  recipientId?: number;

  @ApiProperty()
  @IsNotEmpty({
    message:
      'Recipient nickname should not be empty when recipient ID is provided',
  })
  @ValidateIf((object) => object.recipientId !== undefined)
  recipientNickName?: string;
}

export class UpdateCommentDto extends PartialType(CommentToCommentDto) {}

export class GetCommentsDto {
  @IsNotEmpty({ message: 'Comment text should not be empty' })
  text: any;
}
