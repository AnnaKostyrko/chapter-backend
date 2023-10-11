import { Body, Controller, Get, Render} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FeedService } from "./feed.service";
import { Socket } from "socket.io";
import { ConnectedSocket } from "@nestjs/websockets";

@ApiTags('feed')
@Controller()
export class FeedController{
  constructor(private readonly feedService: FeedService) {}
    

  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  async getFeed() {
    return this.feedService.getFeed();
  }
}
