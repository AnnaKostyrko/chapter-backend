import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';
// import { IsExist } from '../../utils/validators/is-exists.validator';
// import { FileEntity } from '../../files/entities/file.entity';

export class AuthUpdateDto {
  // @ApiProperty({ type: () => FileEntity })
  // @IsOptional()
  // @Validate(IsExist, ['FileEntity', 'id'], {
  //   message: 'imageNotExists',
  // })
  // photo?: FileEntity;

  @ApiProperty({ example: 'http://......' })
  @IsOptional()
  avatarUrl?: string | null;

  @ApiProperty({ example: 'John' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  firstName?: string;

  @ApiProperty({ example: 'Doe' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  lastName?: string;

  @ApiProperty({ example: '@sdfsdjk' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  nickName?: string;

  @ApiProperty({ example: 'some text' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  userStatus?: string;

  @ApiProperty({ example: 'Kyiv' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  location?: string;
}
