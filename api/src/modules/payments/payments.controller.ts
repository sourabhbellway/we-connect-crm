import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query, Req, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('payments')
@UseGuards(AuthGuard('jwt'))
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    create(@Body() createPaymentDto: CreatePaymentDto, @Req() req: any) {
        return this.paymentsService.create(createPaymentDto, req.user);
    }

    @Get()
    findAll(@Query() query: any) {
        return this.paymentsService.findAll(query);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.paymentsService.remove(id);
    }
}
