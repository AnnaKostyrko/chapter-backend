import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

import { passMessage, passwordRegexp } from 'src/helpers/regex/password-regex';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  Validate,
} from 'class-validator';
import { lowerCaseTransformer } from 'src/utils/transformers/lower-case.transformer';
import { IsValidName } from 'src/utils/validators/double-names-validator';

export class UpdateUserRegisterDto {
  @ApiProperty()
  @Transform(lowerCaseTransformer)
  @IsEmail()
  @Matches(/^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
    message: 'Incorrect email',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  @Validate(IsValidName, {
    message: 'Incorrect name',
  })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Doe' })
  @Validate(IsValidName, {
    message: 'Incorrect last name',
  })
  lastName: string;

  @ApiProperty({ example: '@Jojo2323' })
  @IsNotEmpty()
  @Matches(/^@[A-Za-z0-9]{3,30}$/, { message: 'Incorrect format of nick name' })
  nickName: string;
  @IsNotEmpty()
  @Matches(passwordRegexp, {
    message: passMessage,
  })
  @ApiProperty({ example: 'string' })
  @MaxLength(30)
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(8)
  @MaxLength(30)
  confirmPassword: string;

  @ApiProperty({ example: false })
  @IsNotEmpty()
  IsAccessCookie: boolean;
}
