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
import { ProposalTemplatesService } from './proposal-templates.service';
import { UpsertProposalTemplateDto } from './dto/upsert-proposal-template.dto';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('proposal-templates')
export class ProposalTemplatesController {
  constructor(private readonly service: ProposalTemplatesService) { }

  @Get()
  @RequirePermission('proposal_templates.read')
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.service.list({
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      search,
    });
  }

  @Get(':id')
  @RequirePermission('proposal_templates.read')
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  @RequirePermission('proposal_templates.create')
  create(@Body() dto: UpsertProposalTemplateDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @RequirePermission('proposal_templates.update')
  update(@Param('id') id: string, @Body() dto: UpsertProposalTemplateDto) {
    return this.service.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('proposal_templates.delete')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
