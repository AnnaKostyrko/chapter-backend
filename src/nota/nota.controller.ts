import {
  Controller,
  Get,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { NotaService } from './nota.service';

import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller({ path: 'nota', version: '1' })
@ApiBearerAuth()
@ApiTags('nota')
export class NotaController {
  constructor(private readonly notaService: NotaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notification' })
  @UseGuards(AuthGuard('jwt'))
  findAll(@Request() req: any) {
    return this.notaService.findAll(req.user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'delete notification' })
  @UseGuards(AuthGuard('jwt'))
  async remove(@Request() req: any, @Param('id') id: number) {
    return this.notaService.remove(req.user.id, id);
  }
}
