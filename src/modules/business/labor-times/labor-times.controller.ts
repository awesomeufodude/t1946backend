import { Controller, Get, Logger, NotFoundException, Param } from '@nestjs/common';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { LaborTimesService } from './labor-times.service';

@Controller('business/v1/stores')
export class LaborTimesController {
  constructor(
    private readonly laborTimesService: LaborTimesService,
    private readonly logger: Logger,
  ) {}

  @Get(':storeId/labor-time/:businessLineId')
  async findLaborTimeByStoreAndBusinessLine(
    @Param('storeId') storeId: string,
    @Param('businessLineId') businessLineId: string,
  ) {
    this.logger.log('getAllConversationsByUserAndDate');

    const laborTime = await this.laborTimesService.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId);

    if (!laborTime) {
      throw new NotFoundException();
    }

    return new SuccessResponseDto(laborTime);
  }
}
