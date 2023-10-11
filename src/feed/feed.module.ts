import { Module, Post } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { PostEntity } from "src/post/entities/post.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedService } from "./feed.service";


@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity]),
],
    providers: [
        FeedService,
    ],
    controllers: [FeedController],
})
export class FeedModule {} 