import { Body, Controller, Get, Render, Res} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FeedService } from "./feed.service";
import { join } from "path";
import { Response } from 'express';
import { FeedGateway } from "./gateway/feet.gateway";
// import {FeedGateway} from './gateways/feed.gateway'

@ApiTags('feed')
@Controller()
export class FeedController{
constructor(
private readonly feedService: FeedService,
private readonly Gateway: FeedGateway

) {}

@ApiOperation({ summary: 'Get a feed' })
@Get('feed')
async getFeed() {
return this.feedService.getFeed().then((posts)=>{
    this.Gateway.server.emit('GetPosts',posts)
})
}


}