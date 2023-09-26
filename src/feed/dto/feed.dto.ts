import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FeedDto {
    
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  id: number;

}
