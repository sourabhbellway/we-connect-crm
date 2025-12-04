import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Get()
  list(@Query('leadId') leadId: string) {
    if (!leadId) {
      return { success: false, message: 'leadId is required' };
    }
    return this.service.list(Number(leadId));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  create(@Body() dto: CreateNoteDto, @Req() req: any) {
    // If createdBy is not provided, use the authenticated user
    const userId = dto.createdBy || req?.user?.userId || req?.user?.id;
    return this.service.create({
      ...dto,
      createdBy: userId,
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}

