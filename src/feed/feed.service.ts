import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FeedEntity } from "./entities/feed.entities";
import { Repository } from "typeorm";
import { FeedDto } from "./dto/feed.dto";

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(FeedEntity)
        private readonly feedReposity:  Repository<FeedEntity>,
    ) {}
        async GetPost(outputFeedDto: FeedDto ): Promise<FeedEntity[]>{
            
            return await this.feedReposity.find();

        }





}