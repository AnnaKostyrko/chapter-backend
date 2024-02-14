import { ApiProperty } from '@nestjs/swagger';
import { bookRegExp, bookMessage } from 'src/helpers/regex/book.regexp';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsOptional()
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  @MaxLength(30)
  nameOfBook?: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsOptional()
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  @MaxLength(30)
  author?: string;

  @ApiProperty({
    example: 'http://.......',
  })
  @IsNotEmpty()
  @IsOptional()
  imagePath?: string;

  @ApiProperty({
    example:
      'Harry Potter is a series of fantasy novels by J. K. Rowling about a young wizard and his friends at Hogwarts School.',
  })
  @IsOptional()
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  annotation?: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  book_statusId?: number;
}
