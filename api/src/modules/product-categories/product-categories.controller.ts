import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductCategoriesService } from './product-categories.service';
import { CreateProductCategoryDto } from './dto/create-product-category.dto';
import { UpdateProductCategoryDto } from './dto/update-product-category.dto';

@Controller('business-settings/product-categories')
export class ProductCategoriesController {
  constructor(private readonly productCategoriesService: ProductCategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProductCategoryDto: CreateProductCategoryDto) {
    return this.productCategoriesService.create(createProductCategoryDto);
  }

  @Get()
  findAll() {
    return this.productCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductCategoryDto: UpdateProductCategoryDto,
  ) {
    return this.productCategoriesService.update(id, updateProductCategoryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoriesService.remove(id);
  }

  @Patch(':id/toggle')
  toggleActive(@Param('id', ParseIntPipe) id: number) {
    return this.productCategoriesService.toggleActive(id);
  }
}
