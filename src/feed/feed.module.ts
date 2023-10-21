import { Module, Post } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { PostEntity } from "src/post/entities/post.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedService } from "./feed.service";
import { UsersModule } from "src/users/users.module";
import { UsersService } from "src/users/users.service";
import { Book } from "src/users/entities/book.entity";
import { User } from "src/users/entities/user.entity";
import { FeedGateway } from "./gateways/feed.gateway";


@Module({
    imports: [
        TypeOrmModule.forFeature([FeedService,PostEntity,User,UsersService,Book]),
    ],
    providers: [
        FeedService,
        UsersService,
        FeedGateway
    ],
    controllers: [FeedController],
})
export class FeedModule {} 