import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto {
  @ApiProperty({ example: 'Harry Potter' })
  @IsOptional()
  @IsNotEmpty()
  nameOfBook?: string;

  @ApiProperty({ example: 'J.K. Rowling' })
  @IsOptional()
  @IsNotEmpty()
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
  annotation?: string;

  @ApiProperty({ example: '1' })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  book_statusId?: number;
}
