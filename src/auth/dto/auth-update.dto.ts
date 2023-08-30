import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';
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

  @ApiProperty({ example: 'Kyiv' })
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  location?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty()
  @MinLength(6)
  password?: string;

  @ApiProperty()
  @IsOptional()
  @IsNotEmpty({ message: 'mustBeNotEmpty' })
  oldPassword: string;
}
