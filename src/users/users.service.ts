import {
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, IsNull, Not, Repository } from 'typeorm';
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

  async searchUsers(query: string): Promise<User[]> {
    const matchingUsers = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.nickName LIKE :part', { part: `%${query}%` })
      .select([
        'user.avatarUrl',
        'user.nickName',
        'user.firstName',
        'user.lastName',
        'user.id',
      ])
      .getMany();

    if (matchingUsers.length === 0) {
      throw new NotFoundException({
        error: 'Users not found',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }
    return matchingUsers;
  }

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

  async findOneByDelete(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      withDeleted: true,
      where: {
        email: email,
        deletedAt: Not(IsNull()),
      },
    });
  }

  async findDeletedUserByCondition(
    fields: EntityCondition<User>,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      withDeleted: true,
      where: {
        ...fields,
        deletedAt: Not(IsNull()),
      },
    });
  }

  async update(userId: number, updateProfileDto: DeepPartial<User>) {
    const user = await this.findOne(
      {
        id: userId,
      },
      ['posts', 'subscribers', 'books'],
    );

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

    const mySubscribers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscriber')
      .where('subscriber.id=:userId', { userId })
      .getMany();
    await this.usersRepository.save(user);

    const updatedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      location: user.location,
      userStatus: user.userStatus,
      role: user.role,
      status: user.status,
      myFollowersCount: mySubscribers.length,
      myFollowingCount: user.subscribers.length,
      userBooks: user.books,
    };
    return updatedUser;
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async toggleSubscription(
    currentUserId: number,
    targetUserId: number,
  ): Promise<User> {
    const targetUser = await this.findOne({ id: targetUserId });
    const currentUser = await this.findOne({ id: currentUserId }, [
      'subscribers',
    ]);

    if (!targetUser || !currentUser) {
      throw new NotFoundException({
        error: 'User not found',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    if (currentUserId === targetUserId) {
      throw new ConflictException({
        error: 'You cannot subscribe to yourself!',
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      });
    }

    const isSubscribed = currentUser.subscribers.some(
      (subscriber) => subscriber.id === targetUserId,
    );

    currentUser.subscribers = isSubscribed
      ? currentUser.subscribers.filter(
          (subscriber) => subscriber.id !== targetUserId,
        )
      : [...currentUser.subscribers, targetUser];

    await currentUser.save();

    return currentUser;
  }

  async me(userId: number): Promise<Partial<object>> {
    const user = await this.findOne(
      {
        id: userId,
      },
      ['posts', 'subscribers', 'books'],
    );

    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: 'User not found.',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const mySubscribers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscriber')
      .where('subscriber.id=:userId', { userId })
      .getMany();

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      location: user.location,
      userStatus: user.userStatus,
      role: user.role,
      status: user.status,
      myFollowersCount: mySubscribers?.length || null,
      myFollowingCount: user.subscribers?.length || null,
      userBooks: user.books,
    };
  }

  async getGuestsUserInfo(userId: number): Promise<Partial<object>> {
    const user = await this.findOne({ id: userId }, ['subscribers', 'books']);

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const subscribers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscriber')
      .where('subscriber.id=:userId', { userId })
      .getMany();

    return {
      avatarUrl: user.avatarUrl,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      location: user.location,
      userStatus: user.userStatus,
      myFollowersCount: subscribers.length ?? null,
      myFollowingCount: user.subscribers.length ?? null,
      userBooks: user.books,
    };
  }

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
    const book = this.bookRepository.create(createBookDto);
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['books'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    book.user = user;
    await this.bookRepository.save(book);

    if (!user.books) {
      user.books = [];
    }

    if (user.books.length > 12) {
      throw new ConflictException('User already has 12 books');
    }

    user.books.push(book);
    await this.usersRepository.save(user);

    return book;
  }

  async updateBook(id: number, updateData): Promise<Book> {
    await this.bookRepository.update(id, updateData);

    const updatedBook = await this.bookRepository.findOne({ where: { id } });
    if (!updatedBook) {
      throw new NotFoundException('Book not found');
    }
    return updatedBook;
  }

  async deleteBook(id: number): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Book not found');
    }
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

  async getMyFollowWithPagination(
    userId: number,
    page: number,
    limit: number,
  ): Promise<object> {
    const user = await this.findOne(
      {
        id: userId,
      },
      ['subscribers'],
    );
    if (!user) {
      throw new Error('User not found');
    }
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedFollow = user.subscribers.slice(startIndex, endIndex);
    return {
      myFollow: paginatedFollow,
      page,
      limit,
      total: user.subscribers.length,
    };
  }

  async getMyFollowersWithPagination(
    userId: number,
    page: number,
    limit: number,
  ): Promise<object> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw createResponse(HttpStatus.NOT_FOUND, 'User not found.');
    }

    if (page <= 0 || limit <= 0) {
      throw createResponse(HttpStatus.BAD_REQUEST, 'Invalid page or limit.');
    }

    const myFollowers = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.subscribers', 'subscriber')
      .where('subscriber.id=:userId', { userId })
      .getMany();

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedFollowers = myFollowers.slice(startIndex, endIndex);

    return { myFollowers: paginatedFollowers };
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findOne({ id: id });

    if (!user) {
      throw createResponse(HttpStatus.NOT_FOUND, 'User not found.');
    }

    await this.usersRepository.remove(user);
  }

  async findAllDeletedUsers(): Promise<User[]> {
    return this.usersRepository.find({
      withDeleted: true,
      where: {
        deletedAt: Not(IsNull()),
      },
    });
  }

  async restoringUser(id: number) {
    await this.usersRepository.restore(id);
  }
}
