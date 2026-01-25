import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import {
  CreateOrderDto,
  OrderResponseDto,
  OrderListResponseDto,
} from './dto/order.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';

@ApiTags('orders')
@Controller('order')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(ThrottlerGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Создать новый заказ',
    description: 'Создает заказ на бронирование одного или нескольких билетов',
  })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Заказ успешно создан',
    type: OrderListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Некорректные данные запроса',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Фильм или сеанс не найден',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Место уже занято',
  })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список всех заказов',
    description: 'Возвращает список всех заказов',
  })
  @ApiBearerAuth()
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Ограничение количества результатов',
    type: Number,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Смещение для пагинации',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Список заказов',
    type: [OrderResponseDto],
  })
  async findAll(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    const orders = await this.orderService.findAll();
    return orders.slice(offset, offset + limit);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить информацию о заказе',
    description: 'Возвращает информацию о заказе по его ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID заказа',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Информация о заказе',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  async findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Отменить заказ',
    description: 'Отменяет заказ по его ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID заказа',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Заказ успешно отменен',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Заказ не найден',
  })
  async remove(@Param('id') id: string) {
    await this.orderService.remove(id);
  }
}
