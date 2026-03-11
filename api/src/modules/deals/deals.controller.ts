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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import { User } from '../../common/decorators/user.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@Controller('deals')
export class DealsController {
  constructor(private readonly deals: DealsService) {}

  @Get()
  @RequirePermission('deal.read')
  list(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @User() user?: any,
  ) {
    return this.deals.list(
      {
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
        search,
      },
      user,
    );
  }

  @Get(':id')
  @RequirePermission('deal.read')
  get(@Param('id') id: string, @User() user?: any) {
    return this.deals.getById(Number(id), user);
  }

  @Post()
  @RequirePermission('deal.create')
  create(@Body() dto: CreateDealDto, @User() user?: any) {
    return this.deals.create(dto, user?.userId);
  }

  @Put(':id')
  @RequirePermission('deal.update')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.deals.update(Number(id), dto);
  }

  @Delete(':id')
  @RequirePermission('deal.delete')
  remove(@Param('id') id: string) {
    return this.deals.remove(Number(id));
  }

  @Put('bulk/assign')
  @RequirePermission('deal.update')
  bulkAssign(@Body() dto: { dealIds: number[]; userId: number | null }) {
    return this.deals.bulkAssign(dto);
  }

  @Post('bulk/import')
  @UseInterceptors(
    FileInterceptor('csvFile', {
      fileFilter: (req, file, cb) => {
        if (!file.originalname.endsWith('.csv')) {
          return cb(
            new BadRequestException('Only CSV files are allowed'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermission('deal.create')
  async bulkImportDeals(
    @UploadedFile() file: Express.Multer.File,
    @User() user?: any,
  ) {
    if (!file) {
      throw new BadRequestException('CSV file is required');
    }
    return this.deals.bulkImportFromCsv(file, user?.userId);
  }

  @Get('bulk/export')
  @RequirePermission('deal.read')
  async bulkExport(
    @Res() res: Response,
    @Query('search') search?: string,
    @User() user?: any,
  ) {
    const csv = await this.deals.bulkExport({ search }, user);
    const filename = `deals_export_${new Date().toISOString().slice(0, 10)}.csv`;
    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(Buffer.from(bom + csv, 'utf8'));
  }
}
