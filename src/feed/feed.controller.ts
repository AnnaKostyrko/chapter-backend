import { Body, Controller, Get, Render, Res} from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { FeedService } from "./feed.service";
import { join } from "path";
import { Response } from 'express';
import {FeedGateway} from './gateways/feed.gateway'

@ApiTags('feed')
@Controller()
export class FeedController{
  constructor(
    private readonly feedService: FeedService,
    private readonly FeedGateway: FeedGateway
    ) {}
  
  @ApiOperation({ summary: 'Get a feed' })
  @Get('feed')
  async getFeed() {
    return this.feedService.getFeed();
  }
  
  connectClient() {
    this.FeedGateway.server.emit('connect', { message: 'Client connected' });
  }

  disconnectClient() {
    this.FeedGateway.server.emit('disconnect', { message: 'Client disconnected' });
  }

}
