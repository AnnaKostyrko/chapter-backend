import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Request,
  Post,
  UseGuards,
  Patch,
  SerializeOptions,
  Param,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';

import { AuthGuard } from '@nestjs/passport';
import { LoginResponseType } from './types/login-response.type';
import { User } from '../users/entities/user.entity';

import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UpdateUserRegisterDto } from 'src/users/dto/complete-register.dto';

import { Response, Request as req } from 'express';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  public async login(
    @Body() loginDto: AuthEmailLoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResponseType | object> {
    const loginResponse = (await this.service.validateLogin(
      loginDto,
      false,
    )) as LoginResponseType;

    response.cookie('refresh_token', loginResponse.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      sameSite: 'none',
      secure: true,
    });

    return {
      token: loginResponse.token,
      tokenExpires: loginResponse.tokenExpires,
      user: loginResponse.user,
    } as LoginResponseType;
  }

  @SerializeOptions({
    groups: ['me'],
  })
  @Post('admin/email/login')
  @HttpCode(HttpStatus.OK)
  public adminLogin(
    @Body() loginDTO: AuthEmailLoginDto,
  ): Promise<LoginResponseType | object> {
    return this.service.validateLogin(loginDTO, true);
  }

  @Post('email/register')
  @HttpCode(HttpStatus.NO_CONTENT)
  async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<void> {
    return this.service.register(createUserDto);
  }

  @Post('nickname-validation/:nickname')
  @HttpCode(HttpStatus.OK)
  async nickValidation(@Param('nickname') nickname: string): Promise<void> {
    return await this.service.validateNickname(nickname);
  }

  @Patch('refresh-unique-token')
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshToken(
    @Body() createUserDto: AuthRegisterLoginDto,
  ): Promise<void> {
    await this.service.resendConfirmationCode(createUserDto.email);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Ok',
    type: User,
  })
  async confirmEmail(
    @Body() confirmEmailDto: AuthConfirmEmailDto,
  ): Promise<{ id: number; email: string }> {
    return await this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Patch('email/register/finaly/:id')
  async completeRegistration(
    @Param('id') userId: number,
    @Body() completeDto: UpdateUserRegisterDto,
  ): Promise<void> {
    return await this.service.completeRegistration(userId, completeDto);
  }

  @Post('forgot/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgotPassword(
    @Body() forgotPasswordDto: AuthForgotPasswordDto,
  ): Promise<void> {
    return this.service.forgotPassword(forgotPasswordDto.email);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<void> {
    return this.service.resetPassword(
      resetPasswordDto.hash,
      resetPasswordDto.password,
    );
  }

  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(
    @Request() request: req,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies.refresh_token;
    const refreshResponse = await this.service.refreshToken(refreshToken);
    if (refreshResponse.refreshToken) {
      response.cookie('refresh_token', refreshResponse.refreshToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: 'none',
        secure: true,
      });

      return {
        token: refreshResponse.token,
        tokenExpires: refreshResponse.tokenExpires,
      };
    } else {
      response.status(HttpStatus.UNAUTHORIZED).send('Failed to refresh token');
    }
    return {
      token: refreshResponse.token,
      tokenExpires: refreshResponse.tokenExpires,
    };
  }

  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(
    @Request() request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    response.clearCookie('refresh_token');

    await this.service.logout({
      sessionId: request.user.sessionId,
    });
  }

  @HttpCode(HttpStatus.OK)
  @Post('restoring-user')
  async restoringUser(@Body() restoringDto: AuthRegisterLoginDto) {
    return await this.service.restoringUser(restoringDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('confirm-restoring-user')
  async confirmRestoringUser(@Body() data: AuthConfirmEmailDto) {
    return await this.service.confirmRestoringUser(data.hash);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  @Post('restoring-user-by-google')
  async restoringUserByGoogle(@Request() request) {
    return await this.service.restoringUserByGoogle(request.user.id);
  }
}
