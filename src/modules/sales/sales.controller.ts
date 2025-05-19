import { Controller, Get, Logger, Param, Query, Request, ValidationPipe } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { GetAppointmentsDto } from './appointments/appointments.dto';
import { SalesService } from './sales.service';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';

@Controller('sales/v1')
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly logger: Logger,
  ) {}

  @Get('all')
  async getAllSalesUserAndDate(@Request() req, @Query(new ValidationPipe()) query: GetAppointmentsDto) {
    this.logger.log('getAllSalesUserAndDate');
    const selectedDate = new Date().toISOString().split('T')[0];
    const userId = req.user.sub;
    const storeId = query.storeId;
    const data = await this.salesService.findAllSalesByUserAndDate(userId, selectedDate, storeId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_MENU])
  @Get('menu')
  async getMenu() {
    this.logger.log('getMenu');
    const data = await this.salesService.getMenu();
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECURITY_REVIEW])
  @Get('has-security-review/:storeId')
  async getAllSalesWithSecurityReview(@Request() req, @Param('storeId') storeId: string, @Query('page') page) {
    this.logger.log('getAllSalesWithSecurityReview');
    const userId = req.user.sub;

    const data = await this.salesService.findAllSalesWithSecurityReviewByUserAndDate(userId, storeId, page);

    return new SuccessResponseDto(data);
  }
}
