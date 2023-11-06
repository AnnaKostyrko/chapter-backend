import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com' })
  @Transform(lowerCaseTransformer)
  // @Validate(IsNotExist, ['User'], {
  //   message: 'emailAlreadyExists',
  // })
  @IsEmail()
  @Matches(/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'Incorrect email',
  })
  @IsNotEmpty()
  email: string;
}
