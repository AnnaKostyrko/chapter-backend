import { Module, Post } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { FeedService } from "./feed.service";
import { PostEntity } from "src/post/entities/post.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    imports: [TypeOrmModule.forFeature([PostEntity])],
    providers: [FeedService],
    controllers: [FeedController],
})
export class FeedModule {} 