import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all payments' })
  @ApiResponse({
    status: 200,
    description: 'List of all payments returned successfully',
  })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'Payment ID',
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Payment found successfully' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.findOne(id);
  }
}
