import { BadRequestException, Injectable } from '@nestjs/common';
import { LaborTimeRepository } from 'src/infrastructure/database/repositories/labor-time.repository';
import { ResponseLaborTimeDto } from './labor-times.dto';

@Injectable()
export class LaborTimesService {
  constructor(private readonly laborTimeRepository: LaborTimeRepository) {}

  async findLaborTimeByStoreAndBusinessLine(storeId: string, businessLineId: string) {
    const laborTime = await this.laborTimeRepository.findLaborTimeByStoreAndBusinessLine(storeId, businessLineId);

    if (!laborTime) {
      throw new BadRequestException('Labor time not found');
    }

    return new ResponseLaborTimeDto(laborTime);
  }
}
