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
  SerializeOptions,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/roles/roles.guard';
import { infinityPagination } from 'src/utils/infinity-pagination';
import { User } from './entities/user.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';
import { NullableType } from '../utils/types/nullable.type';

@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @SerializeOptions({
    groups: ['admin'],
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createProfileDto);
  }

  @SerializeOptions({
    groups: ['admin'],
  })
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

  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<User>> {
    return this.usersService.findOne({ id: +id });
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: number,
    @Body() updateProfileDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number): Promise<void> {
    return this.usersService.softDelete(id);
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

  @ApiBearerAuth()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User information for guests',
    type: GuestUserInfoResponse,
  })
  @Get('profile/:userId')
  async getGuestUserInfo(@Param('userId') userId: number) {
    return await this.usersService.getGuestsUserInfo(userId);
  }

  @Get(':id/books/:bookId')
  async getBookInfoByUser(
    @Param('id') userId: number,
    @Param('bookId') bookId: number,
  ): Promise<BookInfoDto> {
    return await this.usersService.getBookInfoByUser(userId, bookId);
  }

  @Post('books')
  @ApiResponse({
    status: HttpStatus.OK,
    type: Book,
  })
  @ApiBody({ type: CreateBookDto, description: 'Create book' })
  async addBookToUser(
    @Request() request: Express.Request & { user: User },
    @Body() createBookDto: CreateBookDto,
  ) {
    return await this.usersService.addBookToUser(
      request.user.id,
      createBookDto,
    );
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

  @Get('my-follow')
  @ApiResponse({
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
    return this.usersService.getMyFollowWithPagination(
      request.user.id,
      page,
      limit,
    );
  }
}
