import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { bookMessage, bookRegExp } from 'src/helpers/regex/book.regexp';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  @MaxLength(30)
  nameOfBook: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsNotEmpty()
  @IsOptional()
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
  @IsNotEmpty()
  @IsOptional()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  annotation?: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  book_statusId: number;
}
