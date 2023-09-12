import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { BookInfoDto } from './dto/book-info.dto';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import bcrypt from 'bcryptjs';
import { createResponse } from 'src/helpers/response-helpers';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
  ) {}

  create(createProfileDto: CreateUserDto): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create(createProfileDto),
    );
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(
    fields: EntityCondition<User>,
    relations: string[] = [],
  ): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
      relations,
    });
  }

  async update(
    userId: number,
    updateProfileDto: DeepPartial<User>,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    if (userId !== user.id) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'You do not have permission to update this user.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    user.firstName = updateProfileDto.firstName ?? user.firstName;
    user.lastName = updateProfileDto.lastName ?? user.lastName;
    user.nickName = updateProfileDto.nickName ?? user.nickName;
    user.location = updateProfileDto.location ?? user.location;
    user.avatarUrl = updateProfileDto.avatarUrl ?? user.avatarUrl;
    user.userStatus = updateProfileDto.userStatus ?? user.userStatus;

    return this.usersRepository.save(user);
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async me(userId: number): Promise<Partial<object>> {
    const user = await this.findOne(
      {
        id: userId,
      },
      ['posts'],
    );
    if (!user) {
      throw new Error('User not found');
    }
    return {
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      location: user.location,
      userStatus: user.userStatus,
    };
  }

  async getBookInfoByUser(id: number, bookId: number): Promise<BookInfoDto> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId, user: { id: id } },
      relations: ['status'],
    });

    if (!book) {
      throw new Error('Book not found for the given user');
    }

    return {
      author: book.author,
      annotation: book.annotation,
      statusName: book.status.name,
    };
  }

  async addBookToUser(
    userId: number,
    createBookDto: CreateBookDto,
  ): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['books'],
    });

    if (!user) {
      throw new Error('User not found');
    }

    book.user = user;
    await this.bookRepository.save(book);

    if (!user.books) {
      user.books = [];
    }

    if (user.books.length > 12) {
      throw new Error('User already has 12 books');
    }

    user.books.push(book);
    await this.usersRepository.save(user);

    return book;
  }

  async updatePassword(userId: number, updtePasswordDto: UpdatePasswordDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw createResponse(HttpStatus.NOT_FOUND, 'User not found.');
    }

    const isValidPassword = await bcrypt.compare(
      updtePasswordDto.oldPassword,
      user.password,
    );

    if (!isValidPassword) {
      throw createResponse(HttpStatus.BAD_REQUEST, 'Incorrect old password!');
    }

    const samePassword = await bcrypt.compare(
      updtePasswordDto.newPassword,
      user.password,
    );

    if (samePassword) {
      throw createResponse(
        HttpStatus.BAD_REQUEST,
        'The new password must be different from the old one!',
      );
    }

    if (updtePasswordDto.newPassword !== updtePasswordDto.repeatNewPassword) {
      throw createResponse(
        HttpStatus.BAD_REQUEST,
        'Both passwords must match!',
      );
    }

    user.password = updtePasswordDto.newPassword;
    await this.usersRepository.save(user);

    // Успішна відповідь
    return createResponse(
      HttpStatus.OK,
      'Password updated successfully',
      false,
    );
  }
}
