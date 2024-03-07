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

@Controller('nota')
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
  remove(@Param('id') id: string) {
    return this.notaService.remove(+id);
  }
}
