import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PostEntity } from "src/post/entities/post.entity";
import { Book } from "src/users/entities/book.entity";
import { User } from "src/users/entities/user.entity";
import { Server } from "socket.io";
import { PostService } from "src/post/post.service";
import { FeedGateway } from "./gateway/feet.gateway";
import { Like } from 'src/like/entity/like.entity';
import { CommentEntity } from "src/comment/entity/comment.entity";

@Module({
    imports:[
        TypeOrmModule.forFeature([PostEntity,User,Book,Like,CommentEntity])
    ],
    providers:[
        FeedService,
        FeedGateway,
        Server,
        PostService,
    ],
    controllers:[FeedController]
})
export class FeedModule {}