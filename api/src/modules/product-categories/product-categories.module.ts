import { Module } from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { ProductCategoriesController } from './product-categories.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [ProductCategoriesController],
  providers: [ProductCategoriesService],
  exports: [ProductCategoriesService],
})
export class ProductCategoriesModule {}