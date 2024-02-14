import { UpdateBookDto } from './dto/update-book.dto';
import { BookInfoDto } from './dto/book-info.dto';
import { Book } from './entities/book.entity';
import { CreateBookDto } from '../book/dto/create-book.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class BookService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getBookInfoByUser(
    userId: number,
    bookId: number,
  ): Promise<BookInfoDto> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['status'],
    });

    if (!book) {
      throw new NotFoundException('Book not found for the given user');
    }

    return {
      author: book.author,
      annotation: book.annotation,
      statusName: book.status.name,
    };
  }

  async toggleFavoriteStatus(bookId: number, userId: number): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['user'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.user.id !== userId) {
      throw new ForbiddenException(
        'You are not allowed to perform this action.',
      );
    }

    const favoriteCount = await this.bookRepository
      .createQueryBuilder('book')
      .where('book.userId = :userId', { userId })
      .andWhere('book.favorite_book_status = :status', { status: true })
      .getCount();

    if (favoriteCount >= 7 && book.favorite_book_status === false) {
      throw new BadRequestException('The number of favorites cannot exceed 7');
    }

    book.favorite_book_status = !book.favorite_book_status;

    const updatedBook: Book = await this.bookRepository.save(book);

    return updatedBook;
  }

  async getBooksOrderedByFavorite() {
    const books = await this.bookRepository.find({
      order: { favorite_book_status: 'DESC' },
    });

    return books;
  }

  async addBookToUser(
    userId: number,
    createBookDto: CreateBookDto,
  ): Promise<Book> {
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
      relations: ['books'],
    });

    const book = this.bookRepository.create(createBookDto);
    book.user = user;

    await this.usersRepository.save(user);
    await this.bookRepository.save(book);

    return book;
  }

  async updateBook(
    userId: number,
    bookId: number,
    updateData: UpdateBookDto,
  ): Promise<Book> {
    const updatedBook = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['user'],
    });

    if (!updatedBook) {
      throw new NotFoundException('Book not found');
    }

    if (updatedBook.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this book',
      );
    }
    await this.bookRepository.update(bookId, updateData);
    await this.bookRepository.findOne({ where: { id: bookId } });

    return updatedBook;
  }

  async deleteBook(userId: number, bookId: number): Promise<void> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
      relations: ['user'],
    });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete a book that does not belong to you',
      );
    }
    await this.bookRepository.delete(bookId);
  }
}
