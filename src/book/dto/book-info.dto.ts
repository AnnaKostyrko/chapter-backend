import { ApiProperty } from '@nestjs/swagger';

export class BookInfoDto {
  @ApiProperty({ example: 'string' })
  author: string;

  @ApiProperty({ example: 'string' })
  annotation: string;

  @ApiProperty({ example: 'string' })
  statusName: string | null;
}
