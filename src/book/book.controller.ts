import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { User } from 'src/users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Book } from './entities/book.entity';
import { BookInfoDto } from './dto/book-info.dto';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Books')
@Controller({
  path: 'books',
  version: '1',
})
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Get(':bookId')
  async getBookInfoByUser(
    @Request() request: any,
    @Param('bookId') bookId: number,
  ): Promise<BookInfoDto> {
    return await this.bookService.getBookInfoByUser(bookId);
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
    return await this.bookService.addBookToUser(request.user.id, createBookDto);
  }

  @Patch(':bookId')
  @ApiOperation({ summary: 'Update book' })
  async updateBook(
    @Request() request,
    @Param('bookId') bookId: number,
    @Body() updateData: UpdateBookDto,
  ): Promise<Book> {
    return await this.bookService.updateBook(
      request.user.id,
      bookId,
      updateData,
    );
  }

  @Delete(':bookId')
  @ApiOperation({ summary: 'delete book' })
  async deleteBook(
    @Request() request,
    @Param('bookId') bookId: number,
  ): Promise<void> {
    return await this.bookService.deleteBook(request.user.id, bookId);
  }

  @Get(':FavoriteBooks')
  async getFavoriteBooks() {
    return await this.bookService.getBooksOrderedByFavorite();
  }

  @Patch('/toggle-favorite-status/:bookId')
  async toggleFavoriteStatus(
    @Param('bookId') bookId: number,
    @Request() request,
  ): Promise<Book> {
    return await this.bookService.toggleFavoriteStatus(bookId, request.user.id);
  }
}
