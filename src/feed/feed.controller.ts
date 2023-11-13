import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { FeedGateway } from './gateway/feet.gateway';
// import {FeedGateway} from './gateways/feed.gateway'

@ApiTags('feed')
@Controller()
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly Gateway: FeedGateway,
  ) {}

  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  async getFeed(
     currentUserId:number,
  ) {
    return this.feedService.getFeed(currentUserId).then((posts) => {
      this.Gateway.server.emit('GetPosts', posts);
    });
  }
}
