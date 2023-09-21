import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, IsNull, Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';
import { Book } from './entities/book.entity';

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

  async findAllUsers(fields: EntityCondition<User>): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: fields,
    });
    return users;
  }

  findManyWithPagination(
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    return this.usersRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
    });
  }

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
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

  async getGuestsUserInfo(userId: number): Promise<Partial<User>> {
    const user = await this.findOne({ id: userId });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
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

  async updateBook(id: number, updateData: Partial<Book>): Promise<Book> {
    await this.bookRepository.update(id, updateData);

    const updatedBook = await this.bookRepository.findOne(id);
    if (!updatedBook) {
      throw new Error('Book not found');
    }
    return updatedBook;
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
}
