import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { FeedGateway } from './gateway/feet.gateway';
// import {FeedGateway} from './gateways/feed.gateway'

import { AuthGuard } from '@nestjs/passport';

@ApiTags('feed')
@Controller()
export class FeedController {
  constructor(
    private readonly feedService: FeedService,
    private readonly Gateway: FeedGateway,
  ) {}

  // @ApiOperation({ summary: 'Get a feed' })
  // @Get('feed')
  // async getFeed(currentUserId: number) {
  //   return this.feedService.getFeed(currentUserId).then((posts) => {
  //     this.Gateway.server.emit('GetPosts', posts);
  //   });
  // }

  //response for swagger
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  async getFeed(@Request() req): Promise<any> {
    const posts = await this.feedService.getFeed(req.user.id);
    this.Gateway.server.emit('GetPosts', posts);

    return posts;
  }
}
