import { IsNotEmpty, IsNumber, IsOptional, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { bookRegExp, bookMessage } from 'src/helpers/regex/book.regexp';

export class UpdateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsOptional()
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
  nameOfBook?: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsOptional()
  @IsNotEmpty()
  @Matches(bookRegExp, {
    message: bookMessage,
  })
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
