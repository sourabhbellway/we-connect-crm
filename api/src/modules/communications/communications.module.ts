import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [CommunicationsController],
  providers: [CommunicationsService, PrismaService],
})
export class CommunicationsModule {}
