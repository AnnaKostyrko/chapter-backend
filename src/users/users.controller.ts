import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import {
  ApiBearerAuth,
  // ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { infinityPagination } from 'src/utils/infinity-pagination';
import { User } from './entities/user.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';

import { UpdatePasswordDto } from './dto/update-password.dto';
import { GuestUserInfoResponse } from 'src/response-example/GuestUserInfoResponse';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { DeepPartial } from 'typeorm';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('search')
  async searchUsers(
    @Request() request,
    @Query('query') query: string,
  ): Promise<DeepPartial<User[]> | { message: string }> {
    return this.usersService.searchUsers(request.user.id, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<InfinityPaginationResultType<User>> {
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.usersService.findManyWithPagination({
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async me(@Request() request): Promise<Partial<User>> {
    return await this.usersService.me(request.user.id);
  }

  @Get('my-follow')
  @ApiResponse({
    status: HttpStatus.OK,
    content: {
      'application/json': {
        example: [
          {
            id: 1,
            firstName: 'firstName',
            lastName: 'lastName',
          },
          {
            id: 2,
            firstName: 'firstName',
            lastName: 'lastName',
          },
        ],
      },
    },
  })
  async getMyFollow(
    @Request() request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return await this.usersService.getMyFollowWithPagination(
      request.user.id,
      page,
      limit,
    );
  }

  @Get('my-followers')
  async getMyFollowers(
    @Request() request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<object> {
    return await this.usersService.getMyFollowersWithPagination(
      request.user.id,
      page,
      limit,
    );
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  update(@Request() request, @Body() updateProfileDto: UpdateUserDto) {
    return this.usersService.update(request.user.id, updateProfileDto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req): Promise<void> {
    return this.usersService.softDelete(req.user.id);
  }

  @Post('subscribe-unsubscribe/:userId')
  @HttpCode(HttpStatus.OK)
  async subscribe(
    @Param('userId') userId: number,
    @Request() req,
  ): Promise<User> {
    const currentUserId = req.user.id;
    return await this.usersService.toggleSubscription(currentUserId, userId);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information for guests',
    type: GuestUserInfoResponse,
  })
  @Get('profile/:userId')
  async getGuestUserInfo(@Param('userId') userId: number, @Request() req) {
    const guestId = req.user.id;
    return await this.usersService.getGuestsUserInfo(userId, guestId);
  }

  @Post('update-password')
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async updatePassword(
    @Request() request,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.usersService.updatePassword(request.user.id, updatePasswordDto);
  }

  @Delete('delete-by-admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  async deleteUser(@Param('id') userId: number): Promise<void> {
    return await this.usersService.deleteUser(userId);
  }
}
