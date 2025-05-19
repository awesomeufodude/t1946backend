import { Controller, Get, Logger, Param, ParseIntPipe, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { TiresService } from './tires.service';
import { GetTiresDoubleDto } from './tires.dto';

@Controller('products/v1/tires')
export class TiresController {
  constructor(
    private readonly tiresService: TiresService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get()
  async findTires(
    @Query('width') width: number,
    @Query('profile') profile: number,
    @Query('rim') rim: number,
    @Query('storeId') storeId: string,
    @Query('channel') channel: string,
  ) {
    const data = await this.tiresService.getTiresByMeasure(width, profile, rim, storeId, channel);
    return new SuccessResponseDto(data);
  }
  @Get('double')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTiresDouble(@Query() query: GetTiresDoubleDto) {
    this.logger.log('getTiresDouble', query);

    const data = await this.tiresService.getTiresDouble(query);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get(':sku')
  async getTireBySku(@Param('sku') sku: string, @Query('storeId') storeId: string, @Query('channel') channel: string) {
    this.logger.log(`getTireBySku: ${sku}`);
    const data = await this.tiresService.getTireBySku(sku, storeId, channel);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get('attributes/widths')
  async getAllwidthByTires() {
    this.logger.log('getAllConversationsByUserAndDate');

    const data = await this.tiresService.getAllWidthsByTires();
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get('attributes/widths/:width/profiles')
  async getProfilesByWidth(@Param('width', ParseIntPipe) width: number) {
    this.logger.log(`getProfilesByWidth: ${width}`);
    const data = await this.tiresService.getProfilesByWidth(width);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get('attributes/widths/:width/profiles/:profile/rims')
  async getRimsByWidthAndProfile(
    @Param('width', ParseIntPipe) width: number,
    @Param('profile', ParseIntPipe) profile: number,
  ) {
    this.logger.log(`getRimsByWidthAndProfile: width=${width}, profile=${profile}`);
    const data = await this.tiresService.getRimsByWidthAndProfile(width, profile);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get('features/all')
  async getTireCharacteristics() {
    this.logger.log('getTireCharacteristics');
    const data = await this.tiresService.getTireCharacteristics();
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_SECTION_SALES])
  @Get('measures/:brand/:model/:year/:versionSlugId')
  async getMeasures(
    @Param('brand') brand: string,
    @Param('model') model: string,
    @Param('year') year: string,
    @Param('versionSlugId') versionSlugId: string,
  ) {
    this.logger.log(`getMeasures: brand=${brand}, model=${model}, year=${year}, versionSlugId=${versionSlugId}`);
    const data = await this.tiresService.getMeasures(brand, model, year, versionSlugId);
    return new SuccessResponseDto(data);
  }
}
