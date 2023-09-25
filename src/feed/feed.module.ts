import { Module } from "@nestjs/common";
import { FeedController } from "./feed.controller";

@Module({
    imports: [],
    providers: [],
    controllers: [FeedController],
})
export class FeedModule {} 