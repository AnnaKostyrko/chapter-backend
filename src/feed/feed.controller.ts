import { Body, Controller, Get} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FeedService } from "./feed.service";
// import { FeedGateway } from "./feed.gateway";
@ApiTags('feed')
@Controller()
export class FeedController{
  constructor(private readonly feedService: FeedService) {}
    

  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  getFeed() {

    // const feed = this.feedService.getFeed();
    // this.FeedGateway.emit("FeedUpdate", feed)

    return this.feedService.getFeed()
  }
}
