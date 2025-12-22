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
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('products')
export class ProductsController {
  constructor(private readonly service: ProductsService) {}

  @Get()
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
  get(@Param('id') id: string) {
    return this.service.getById(Number(id));
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    try {
      console.log('Creating product with data:', JSON.stringify(dto, null, 2));
      const result = await this.service.create(dto);
      if (!result.success) {
        throw new HttpException(
          { success: false, message: result.message },
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error: any) {
      console.error('Error in products controller:', error);
      console.error('Error stack:', error.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      const errorMessage = error?.response?.message || error?.message || 'Failed to create product';
      throw new HttpException(
        { success: false, message: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    try {
      const result = await this.service.update(Number(id), dto);
      if (!result.success) {
        throw new HttpException(
          { success: false, message: result.message },
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error: any) {
      console.error('Error in products controller:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { success: false, message: error.message || 'Failed to update product' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(Number(id));
  }
}
