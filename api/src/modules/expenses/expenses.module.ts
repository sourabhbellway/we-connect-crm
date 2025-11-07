import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { PrismaService } from '../../database/prisma.service';
import { PermissionsGuard } from '../../common/guards/permissions.guard';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService, PermissionsGuard],
})
export class ExpensesModule {}
