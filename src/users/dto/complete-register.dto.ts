import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, Matches, MinLength } from 'class-validator';


export class UpdateUserRegisterDto {

  @IsNotEmpty()
  @ApiProperty({ example: 'John' })
  firstName: string;

  @IsNotEmpty()
  @ApiProperty({ example: 'Doe' })
  lastName: string; 

  @ApiProperty({ example: '@Jojo2323' })
  @IsNotEmpty()
  @MinLength(3)
  nickName: string;


  @IsNotEmpty()
  @ApiProperty({example: 'string'})
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]$/, {
    message: 'one capital letter and one number, also password should be only Latin letters',
   })
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  @MinLength(6)
  confirmPassword:string;
  
}


