import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { BookSeedService } from '../book/book-seed.service';
import { PostSeedService } from '../post/post-seed.service';
import { CommentSeedService } from '../comment/comment-seed.service';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private bookSeedService: BookSeedService,
    private postSeedService: PostSeedService,
    private commentSeedService: CommentSeedService,
  ) {}

  async run() {
    await this.seedAdmin();
    await this.seedUsers(2);
  }

  private async seedAdmin() {
    const countAdmin = await this.userRepository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      await this.userRepository.save(
        this.userRepository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password: 'secret',
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }
  }

  private async seedUsers(count: number) {
    const countUser = await this.userRepository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      for (let i = 1; i <= count; i++) {
        const newUser = this.userRepository.create({
          firstName: `Firstname${i}`,
          lastName: `LastName${i}`,
          email: `user${i}@example.com`,
          password: 'nenadoN!4egonety',
          nickName: `NickName${i}`,
          userStatus: `UserStatus${i}`,
          IsAccessCookie: true,
          location: `Location${i}`,
          role: {
            id: RoleEnum.user,
            name: 'User',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        });

        await this.userRepository.save(newUser);

        await this.bookSeedService.seedBooksForUser(newUser, 2);

        const posts = await this.postSeedService.seedPostsForUser(newUser, 2);

        for (const post of posts) {
          const comments = await this.commentSeedService.seedCommentsForPost(
            post,
            newUser,
            2,
          );

          for (const comment of comments) {
            await this.commentSeedService.seedCommentsForComment(
              comment,
              newUser,
              1,
            );
          }
        }
      }
    }
  }
}
