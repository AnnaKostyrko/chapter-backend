import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsNotEmpty()
  nameOfBook: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsNotEmpty()
  author: string;

  @ApiProperty({
    example: 'http://.......',
  })
  @IsNotEmpty()
  @IsOptional()
  imagePath: string;

  @ApiProperty({
    example:
      'Harry Potter is a series of fantasy novels by J. K. Rowling about a young wizard and his friends at Hogwarts School.',
  })
  @IsNotEmpty()
  annotation: string;

  @ApiProperty({ example: '1' })
  @IsNotEmpty()
  @IsNumber()
  book_statusId: number;
}
