import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityCondition } from 'src/utils/types/entity-condition.type';
import { IPaginationOptions } from 'src/utils/types/pagination-options';
import { DeepPartial, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { NullableType } from '../utils/types/nullable.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  findOne(fields: EntityCondition<User>): Promise<NullableType<User>> {
    return this.usersRepository.findOne({
      where: fields,
      relations: { subscribers: true },
    });
  }

  update(id: User['id'], payload: DeepPartial<User>): Promise<User> {
    return this.usersRepository.save(
      this.usersRepository.create({
        id,
        ...payload,
      }),
    );
  }

  async softDelete(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async subscribe(currentUserId: number, targetUserId: number): Promise<any> {
    // Check if there is a user to subscribe to.
    const targetUser = await this.findOne({ id: targetUserId });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }
    // Check that the user is not subscribing to himself
    if (currentUserId === targetUserId) {
      throw new NotFoundException('You cannot subscribe to yourself!');
    }

    const currentUser = await this.findOne({ id: currentUserId });

    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    if (!currentUser.subscribers) {
      currentUser.subscribers = [];
    }

    const isAlreadySubscribed = currentUser.subscribers.some(
      (subscriber) => subscriber.id === targetUserId,
    );

    if (isAlreadySubscribed) {
      throw new ConflictException('You are already subscribed to this user');
    }

    currentUser.subscribers.push(targetUser);

    await currentUser.save();

    return currentUser;
  }
}
