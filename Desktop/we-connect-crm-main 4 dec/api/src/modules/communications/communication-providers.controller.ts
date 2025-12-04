import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommunicationProvidersService } from './communication-providers.service';

@UseGuards(AuthGuard('jwt'))
@Controller('communication/providers')
export class CommunicationProvidersController {
  constructor(private readonly service: CommunicationProvidersService) {}

  @Get()
  listProviders() {
    return this.service.listProviders();
  }

  @Post()
  createProvider(@Body() body: any) {
    return this.service.createProvider(body);
  }

  @Put(':id')
  updateProvider(@Param('id') id: string, @Body() body: any) {
    return this.service.updateProvider(Number(id), body);
  }

  @Delete(':id')
  deleteProvider(@Param('id') id: string) {
    return this.service.deleteProvider(Number(id));
  }

  @Post(':id/test')
  testProvider(@Param('id') id: string, @Body() body: any) {
    return this.service.testProvider(Number(id), body);
  }
}
