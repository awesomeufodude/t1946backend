import { Controller, Get, Logger, Query, Request, ValidationPipe } from '@nestjs/common';
import { WorkordersService } from './workorders.service';
import { AppDomain } from 'src/shared/domain/app.domain';
import { Private } from 'src/shared/decorators/auth.decorators';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { GetWorkorderDto } from './get-workorders.dto';

@Controller('sales/v1/reassigned-workorders')
export class ReassignedWorkordersController {
  constructor(
    private readonly workordersService: WorkordersService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_REASSIGNED_WORKORDERS])
  @Get()
  async getAllWorkorderByUserAndDate(@Request() req, @Query(new ValidationPipe()) query: GetWorkorderDto) {
    this.logger.log('getAllConversationsByUserAndDate');
    const selectedDate = query.date || new Date().toISOString().split('T')[0];
    const userId = req.user.sub;

    const data = await this.workordersService.findByUserAndDateReassigned(userId, selectedDate, query.storeId);
    return new SuccessResponseDto(data);
  }
}
