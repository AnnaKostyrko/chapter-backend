import { Body, Controller, Post } from "@nestjs/common";
import { FeedService } from "./feed.service";
import { FeedDto } from "./dto/feed.dto";
import { FeedEntity } from "./entities/feed.entities";

@Controller()
export class FeedController{
  constructor(private readonly feedService: FeedService) {}
    
  @Post('feed')
    async GetAllFeeds( @Body() feedDto: FeedDto): Promise<FeedEntity[]>{
       return await this. feedService.GetPost(feedDto);
    }
}
