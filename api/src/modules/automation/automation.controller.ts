import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('automation')
@UseGuards(AuthGuard('jwt'))
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('workflows')
  create(@Body() createWorkflowDto: CreateWorkflowDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.automationService.create(createWorkflowDto, userId);
  }

  @Get('workflows')
  findAll(@Query('includeInactive') includeInactive?: string) {
    return this.automationService.findAll(includeInactive === 'true');
  }

  @Get('workflows/:id')
  findOne(@Param('id') id: string) {
    return this.automationService.findOne(+id);
  }

  @Patch('workflows/:id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.automationService.update(+id, updateWorkflowDto);
  }

  @Delete('workflows/:id')
  remove(@Param('id') id: string) {
    return this.automationService.remove(+id);
  }

  @Patch('workflows/:id/toggle')
  toggleActive(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.automationService.toggleActive(+id, isActive);
  }

  @Post('workflows/:id/execute')
  executeWorkflow(@Param('id') id: string, @Body() triggerData: any) {
    return this.automationService.executeWorkflow(+id, triggerData);
  }

  @Get('executions')
  getExecutionHistory(
    @Query('workflowId') workflowId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.automationService.getExecutionHistory(
      workflowId ? +workflowId : undefined,
      limit ? +limit : 50,
    );
  }
}
