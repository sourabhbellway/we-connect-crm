import { Module } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { UnitTypesController } from './unit-types.controller';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [UnitTypesController],
  providers: [UnitTypesService, PrismaService],
  exports: [UnitTypesService],
})
export class UnitTypesModule {}