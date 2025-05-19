import { Controller, Get, Param, Query } from '@nestjs/common';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { StoresService } from './stores.service';

@Controller('business/v1/stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get(':storeId/technicians')
  async findTechniciansByStore(@Param('storeId') storeId: string) {
    const technicians = await this.storesService.findUsersByRolesAndStore(storeId, AppDomain.TECHNICIANS);

    return new SuccessResponseDto(technicians);
  }

  @Get(':storeId/users')
  async findUsersByStore(@Param('storeId') storeId: string, @Query('role') role: string) {
    const users = await this.storesService.findUsersByRolesAndStore(storeId, [role]);

    return new SuccessResponseDto(users);
  }

  @Get(':storeId/scheduling-blocks/:businessLineId/:date/:mode')
  async findSchedulingBlocksByStore(
    @Param('storeId') storeId: string,
    @Param('businessLineId') businessLineId: number,
    @Param('date') date: string,
    @Param('mode') mode: string,
  ) {
    const schedulingBlocks = await this.storesService.findSchedulingBlocksByStore(storeId, businessLineId, date, mode);

    return new SuccessResponseDto(schedulingBlocks);
  }
}
