import { Injectable, Logger } from '@nestjs/common';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { SalesDomain } from 'src/shared/domain/sales.domain';

@Injectable()
export class ServicesService {
  constructor(
    private readonly logger: Logger,
    private readonly serviceItemsStatusesRepository: ServiceItemsStatusesRepository,
  ) {}

  async getServiceItemsStatuses() {
    this.logger.log('getServiceItemsStatuses');
    const data = await this.serviceItemsStatusesRepository.findAll();

    return data.filter((item) => item.code !== SalesDomain.SERVICE_ITEM_STATUS.PENDING);
  }
}
