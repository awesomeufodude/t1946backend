import { Controller, Get, Logger } from '@nestjs/common';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { ServicesService } from './services.service';

@Controller('services/v1')
export class ServicesController {
  constructor(
    private readonly logger: Logger,
    private readonly servicesService: ServicesService,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_CONVERSATIONS, AppDomain.Permissions.VIEW_TABLE_WORKORDERS])
  @Get('/service-items-statuses')
  async getServiceItemsStatuses() {
    this.logger.log('getServiceItemsStatuses');
    const data = await this.servicesService.getServiceItemsStatuses();
    return new SuccessResponseDto(data);
  }
}
