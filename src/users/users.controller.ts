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
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { infinityPagination } from 'src/utils/infinity-pagination';
import { User } from './entities/user.entity';
import { InfinityPaginationResultType } from '../utils/types/infinity-pagination-result.type';

import { BookInfoDto } from './dto/book-info.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { GuestUserInfoResponse } from 'src/response-example/GuestUserInfoResponse';
import { Roles } from 'src/roles/roles.decorator';
import { RoleEnum } from 'src/roles/roles.enum';
import { RolesGuard } from 'src/roles/roles.guard';
import { UpdateBookDto } from './dto/update-book.dto';

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
  async searchUsers(@Query('query') query: string): Promise<User[]> {
    const users = await this.usersService.searchUsers(query);
    return users.slice(0, 5);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto): Promise<User> {
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
  @ApiOperation({ summary: 'Post new book' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: Book,
  })
  async addBookToUser(
    @Request() request: Express.Request & { user: User },
    @Body() createBookDto: CreateBookDto,
  ) {
    return await this.usersService.addBookToUser(
      request.user.id,
      createBookDto,
    );
  }

  @Patch(':bookId')
  @ApiOperation({ summary: 'Update book' })
  async updateBook(
    @Param('bookId') bookId: number,
    @Body() updateData: UpdateBookDto,
  ): Promise<Book> {
    return await this.usersService.updateBook(bookId, updateData);
  }

  @Delete(':bookId')
  async deleteBook(@Param('bookId') bookId: number): Promise<void> {
    return await this.usersService.deleteBook(bookId);
  }

  @Get(':FavoriteBooks')
  async getFavoriteBooks() {
    return await this.usersService.getBooksOrderedByFavorite();
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/toggle-favorite-status/:bookId')
  async toggleFavoriteStatus(
    @Param('bookId') bookId: number,
    @Request() request,
  ): Promise<Book> {
    return await this.usersService.toggleFavoriteStatus(
      bookId,
      request.user.id,
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

  @Delete('delete-by-admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(RoleEnum.admin)
  async deleteUser(@Param('id') userId: number): Promise<void> {
    return await this.usersService.deleteUser(userId);
  }
}
