import { Module } from '@nestjs/common';
import { CurrenciesService } from './currencies.service';
import { CurrenciesController } from './currencies.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [CurrenciesController],
    providers: [CurrenciesService],
    exports: [CurrenciesService],
})
export class CurrenciesModule { }
