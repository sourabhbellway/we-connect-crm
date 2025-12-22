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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { User } from '../../common/decorators/user.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('notes')
export class NotesController {
  constructor(private readonly service: NotesService) { }

  @Get()
  list(@Query('leadId') leadId: string, @User() user?: any) {
    if (!leadId) {
      return { success: false, message: 'leadId is required' };
    }
    return this.service.list(Number(leadId), user);
  }

  @Get(':id')
  get(@Param('id') id: string, @User() user?: any) {
    return this.service.getById(Number(id), user);
  }

  @Post()
  create(@Body() dto: CreateNoteDto, @User() user?: any) {
    // If createdBy is not provided, use the authenticated user
    const userId = dto.createdBy || user?.userId;
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

