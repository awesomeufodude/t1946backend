import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Controller, Delete, Inject, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { NotAvailableInTouch, Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';

import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

@Controller('admin/v1')
export class AdminController {
  constructor(
    private readonly logger: Logger,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @Delete('/cache')
  @Private([AppDomain.Permissions.VIEW_SECTION_ADMINISTRATION])
  @NotAvailableInTouch()
  public async resetCache(): Promise<SuccessResponseDto<void>> {
    this.logger.log('resetCache');
    this.cacheManager.reset();
    return new SuccessResponseDto(null);
  }
}
