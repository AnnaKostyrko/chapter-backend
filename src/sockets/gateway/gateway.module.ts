import { Module } from '@nestjs/common';
import { MyGateway } from './gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [MyGateway, JwtService],
  exports: [MyGateway],
})
export class GatewayModule {}
