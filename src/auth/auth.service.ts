import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import ms from 'ms';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';

import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import crypto from 'crypto';
import { plainToClass } from 'class-transformer';
import { Status } from 'src/statuses/entities/status.entity';
import { Role } from 'src/roles/entities/role.entity';
import { AuthProvidersEnum } from './auth-providers.enum';
import { SocialInterface } from 'src/social/interfaces/social.interface';
import { UsersService } from 'src/users/users.service';
import { ForgotService } from 'src/forgot/forgot.service';
import { MailService } from 'src/mail/mail.service';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseType } from './types/login-response.type';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from 'src/config/config.type';
import { SessionService } from 'src/session/session.service';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { Session } from 'src/session/entities/session.entity';

import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { UpdateUserRegisterDto } from 'src/users/dto/complete-register.dto';
import { createResponse } from 'src/helpers/response-helpers';
import { deletedAccountMessage } from 'src/helpers/messages/messages';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
    private forgotService: ForgotService,
    private sessionService: SessionService,
    private mailService: MailService,
    private configService: ConfigService<AllConfigType>,
  ) {}

  async validateLogin(
    loginDto: AuthEmailLoginDto,
    onlyAdmin: boolean,
  ): Promise<LoginResponseType> {
    const deletedUser = await this.usersService.findDeletedUserByCondition({
      email: loginDto.email,
    });

    if (deletedUser) {
      throw createResponse(HttpStatus.FORBIDDEN, deletedAccountMessage);
    }

    const user = await this.usersService.findOne({
      email: loginDto.email,
    });

    if (
      !user ||
      (user?.role &&
        !(onlyAdmin ? [RoleEnum.admin] : [RoleEnum.user]).includes(
          user.role.id,
        ))
    ) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (user.provider !== AuthProvidersEnum.email) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: `needLoginViaProvider:${user.provider}`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isValidPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token,
      tokenExpires,
      user,
    };
  }

  async validateSocialLogin(
    authProvider: string,
    socialData: SocialInterface,
  ): Promise<LoginResponseType | object> {
    let user: NullableType<User>;
    const socialEmail = socialData.email?.toLowerCase();

    const deletedUser = await this.usersService.findDeletedUserByCondition({
      email: socialEmail,
    });

    if (deletedUser) {
      const response = createResponse(
        HttpStatus.FORBIDDEN,
        deletedAccountMessage,
      );
      const secret = this.configService.getOrThrow('auth.secret', {
        infer: true,
      });
      const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
        infer: true,
      });
      const tokenExpires = Date.now() + ms(tokenExpiresIn);

      const restoreToken = await this.jwtService.signAsync(
        { id: deletedUser.id },
        { secret, expiresIn: tokenExpires },
      );
      return { response, restoreToken };
    }

    const userByEmail = await this.usersService.findOne({
      email: socialEmail,
    });

    user = await this.usersService.findOne({
      socialId: socialData.id,
      provider: authProvider,
    });

    if (user) {
      ////////////////////////////////////////
      await user.save();

      if (socialEmail && !userByEmail) {
        user.email = socialEmail;
      }
      await this.usersService.update(user.id, user);
    } else if (userByEmail) {
      user = userByEmail;
    } else {
      const role = plainToClass(Role, {
        id: RoleEnum.user,
      });
      const status = plainToClass(Status, {
        id: StatusEnum.active,
      });

      user = await this.usersService.create({
        email: socialEmail ?? null,
        firstName: socialData.firstName ?? null,
        lastName: socialData.lastName ?? null,
        socialId: socialData.id,
        provider: authProvider,
        role,
        status,
      });

      user = await this.usersService.findOne({
        id: user.id,
      });
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'userNotFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const session = await this.sessionService.create({
      user,
    });

    const {
      token: jwtToken,
      refreshToken,
      tokenExpires,
    } = await this.getTokensData({
      id: user.id,
      role: user.role,
      sessionId: session.id,
    });

    return {
      refreshToken,
      token: jwtToken,
      tokenExpires,
      user,
    };
  }

  async register(dto: AuthRegisterLoginDto): Promise<void> {
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')
      .slice(-6);

      const userWithDelData = await this.usersService.findOneByDelete(dto.email);

      if (userWithDelData)  { 
          throw new BadRequestException('Registration with this email is not possible because the account has been deleted, please restore your account or select another email');
      }

    const existingUser = await this.usersService.findOne({ email: dto.email });
    if (existingUser) {
      const emailStatus = existingUser.status?.name;
      throw new ConflictException({
        error: `User with this email already exists. Email status:${emailStatus}`,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    await this.usersService.create({
      ...dto,
      email: dto.email,
      role: {
        id: RoleEnum.user,
      } as Role,
      status: {
        id: StatusEnum.inactive,
      } as Status,
      hash,
    });

    await this.mailService.userSignUp({
      to: dto.email,
      data: {
        hash,
      },
    });
  }

  async resendConfirmationCode(email: string): Promise<void> {
    const user = await this.usersService.findOne({ email });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')
      .slice(-6);

    user.hash = hash;
    await user.save();

    await this.mailService.userSignUp({
      to: email,
      data: {
        hash,
      },
    });
    // Delay setting user.hash to null
    setTimeout(async () => {
      const delay = (ms) => new Promise((res) => setTimeout(res, ms));

      await delay(15 * 60 * 1000);

      user.hash = null;
      await user.save();
    }, 15 * 60 * 1000);
  }

  async confirmEmail(uniqueToken: string): Promise<{ id: number }> {
    const user = await this.usersService.findOne({
      hash: uniqueToken,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user.status = plainToClass(Status, {
      id: StatusEnum.active,
    });
    user.hash = null;
    await user.save();
    return { id: user.id };
  }

  async completeRegistration(
    userId: number,
    completeDto: UpdateUserRegisterDto,
  ): Promise<void> {
    /// Find a user by their id, with a filter based on registration status
    const user = await this.usersService.findOne({
      id: userId,
    });

    if (!completeDto.nickName.startsWith('@')) {
      throw new BadRequestException('Nickname should start with "@"');
    }

    if (completeDto.password !== completeDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const userNickName = await this.usersService.findOne({
      nickName: completeDto.nickName,
    });

    if (userNickName) {
      throw new ConflictException({
        error: `User with this nickname already exists.`,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found or not active',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    user.nickName = completeDto.nickName;

    user.firstName = completeDto.firstName;

    user.lastName = completeDto.lastName;

    user.password = completeDto.password;

    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findOne({
      email,
    });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'emailNotExists',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.forgotService.create({
      hash,
      user,
    });

    await this.mailService.forgotPassword({
      to: email,
      data: {
        hash,
      },
    });
  }

  async resetPassword(hash: string, password: string): Promise<void> {
    const forgot = await this.forgotService.findOne({
      where: {
        hash,
      },
    });

    if (!forgot) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            hash: `notFound`,
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const user = forgot.user;
    user.password = password;

    await this.sessionService.softDelete({
      user: {
        id: user.id,
      },
    });
    ////////////////////
    await user.save();
    await this.forgotService.softDelete(forgot.id);
  }

  async refreshToken(
    data: Pick<JwtRefreshPayloadType, 'sessionId'>,
  ): Promise<Omit<LoginResponseType, 'user'>> {
    if (!data) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          errors: {
            user: 'must be autorized',
          },
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const secretKey = this.configService.getOrThrow('auth.refreshSecret', {
      infer: true,
    });
    const verifyToken = this.jwtService.verify(data.toString(), {
      secret: secretKey,
    });
    if (!verifyToken) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const session = await this.sessionService.findOne({
      where: {
        id: data.sessionId,
      },
    });
    if (!session) {
      throw new UnauthorizedException();
    }

    const currentTime = Date.now() / 1000;

    if (verifyToken.exp <= currentTime) {
      await this.logout({ sessionId: session.id });
      throw new UnauthorizedException('Refresh token has expired');
    }

    const { token, refreshToken, tokenExpires } = await this.getTokensData({
      id: session.user.id,
      role: session.user.role,
      sessionId: session.id,
    });

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async softDelete(user: User): Promise<void> {
    await this.usersService.softDelete(user.id);
  }

  // LOGOUT

  async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
    return this.sessionService.softDelete({
      id: data.sessionId,
    });
  }

  private async getTokensData(data: {
    id: User['id'];
    role: User['role'];
    sessionId: Session['id'];
  }) {
    const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
      infer: true,
    });

    const tokenExpires = Date.now() + ms(tokenExpiresIn);

    const [token, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(
        {
          id: data.id,
          role: data.role,
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.secret', { infer: true }),
          expiresIn: tokenExpiresIn,
        },
      ),

      await this.jwtService.signAsync(
        {
          sessionId: data.sessionId,
        },
        {
          secret: this.configService.getOrThrow('auth.refreshSecret', {
            infer: true,
          }),
          expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
            infer: true,
          }),
        },
      ),
    ]);

    return {
      token,
      refreshToken,
      tokenExpires,
    };
  }

  async restoringUser(data: AuthRegisterLoginDto) {
    const deletedUser = await this.usersService.findDeletedUserByCondition({
      email: data.email,
    });

    if (!deletedUser) {
      throw createResponse(HttpStatus.FORBIDDEN, 'Account not found');
    }

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex')
      .slice(-6);

    await this.mailService.userSignUp({
      to: data.email,
      data: {
        hash,
      },
    });
    deletedUser.hash = hash;
    await deletedUser.save();

    return createResponse(
      HttpStatus.OK,
      'A recovery code was sent to your e-mail',
      false,
    );
  }

  async confirmRestoringUser(hash: string) {
    const existingUser = await this.usersService.findDeletedUserByCondition({
      hash: hash,
    });

    if (!existingUser) {
      throw createResponse(HttpStatus.FORBIDDEN, 'Wrong hash');
    }

    await this.usersService.restoringUser(existingUser.id);
    existingUser.hash = null;

    return createResponse(
      HttpStatus.OK,
      'Account recovery was successful',
      false,
    );
  }

  async restoringUserByGoogle(id: number) {
    const existingUser = await this.usersService.findDeletedUserByCondition({
      id,
    });

    if (!existingUser) {
      throw createResponse(HttpStatus.FORBIDDEN, 'User not found');
    }

    await this.usersService.restoringUser(existingUser.id);

    return createResponse(
      HttpStatus.OK,
      'Account recovery was successful',
      false,
    );
  }
}
