import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { addMinutes } from 'date-fns';
import { Forgot } from '../forgot/entities/forgot.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private usersService: UsersService,
    @InjectRepository(Forgot)
    private forgotRepository: Repository<Forgot>,
  ) {}

  // @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
  //   name: 'findDeletingUsersMoreThan30DaysAgo',
  //   timeZone: 'Europe/Kyiv',
  // })
  // async handleCron(): Promise<void> {
  //   try {
  //     const currentDate = new Date();

  //     const thirtyDaysAgo = addDays(currentDate, -30);

  //     const usersIncludingDeleted =
  //       await this.usersService.findAllDeletedUsers();

  //     for (const user of usersIncludingDeleted) {
  //       if (user.deletedAt && user.deletedAt < thirtyDaysAgo) {
  //         await this.usersRepository.remove(user);
  //       }
  //     }
  //   } catch (error) {
  //     console.error('Error in handleCron:', error);
  //   }
  // }

  @Cron('*/1 * * * *', {
    name: 'findDeletingUsersEveryMinute',
    timeZone: 'Europe/Kyiv',
  })
  async cronForQA(): Promise<void> {
    try {
      const currentDate = new Date();

      const oneMinuteAgo = addMinutes(currentDate, -1);

      const usersIncludingDeleted =
        await this.usersService.findAllDeletedUsers();

      for (const user of usersIncludingDeleted) {
        if (user.deletedAt && user.deletedAt < oneMinuteAgo) {
          await this.usersRepository.remove(user);
        }
      }
    } catch (error) {
      console.error('Error in cronForQA:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'deleteForgotRequest',
    timeZone: 'Europe/Kyiv',
  })
  async handle(): Promise<void> {
    try {
      await this.forgotRepository.clear();
      console.log('clear is succesfull');
    } catch (error) {
      console.error('Error in handleDeleteForgotRequest:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'reset hash count',
    timeZone: 'Europe/Kyiv',
  })
  async resetHashCount(): Promise<void> {
    try {
      await this.usersRepository
        .createQueryBuilder()
        .update(User)
        .set({ hashCount: 0 })
        .execute();

      console.log('reset is succesfull');
    } catch (error) {
      console.error('Error in resetHashCount:', error);
    }
  }
}
