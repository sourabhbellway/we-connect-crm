import { Module } from '@nestjs/common';
import { ProposalTemplatesController } from './proposal-templates.controller';
import { ProposalTemplatesService } from './proposal-templates.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
  controllers: [ProposalTemplatesController],
  providers: [ProposalTemplatesService, PrismaService],
})
export class ProposalTemplatesModule {}
