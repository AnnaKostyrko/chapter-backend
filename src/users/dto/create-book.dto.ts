import { IsNotEmpty, IsNumber, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsNotEmpty()
  @MaxLength(30)
  nameOfBook: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsNotEmpty()
  @IsOptional()
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
  annotation?: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  book_statusId: number;
}
