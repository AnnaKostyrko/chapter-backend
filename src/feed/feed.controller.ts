import { Body, Controller, Get} from "@nestjs/common";
import { FeedService } from "./feed.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('feed')
@Controller()
export class FeedController{
  constructor(private readonly feedService: FeedService) {}
    

  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  getFeed() {
    return this.feedService.getFeed();
  }
}
