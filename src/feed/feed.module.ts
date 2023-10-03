import { Module, Post } from "@nestjs/common";
import { FeedController } from "./feed.controller";
import { PostEntity } from "src/post/entities/post.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeedService } from "./feed.service";
// import { FeedGateway } from "./feed.gateway";

@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity]),
],
    providers: [
        FeedService,
        // FeedGateway
    ],
    controllers: [FeedController],
})
export class FeedModule {} 