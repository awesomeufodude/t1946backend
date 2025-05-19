import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { CreateVehicleByPlateDto, CreateVehicleRequestDto, VehicleDto } from './vehicles.dto';
import { VehiclesService } from './vehicles.service';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';

@Controller('vehicles/v1')
export class VehiclesController {
  constructor(
    private readonly logger: Logger,
    private readonly vehiclesService: VehiclesService,
  ) {}

  @Post()
  public async createVehicle(@Body() vehicle: CreateVehicleRequestDto): Promise<VehicleDto> {
    this.logger.log(`createVehicle: ${JSON.stringify(vehicle, null, 2)}`);
    const createdVehicle = await this.vehiclesService.create(vehicle);
    return createdVehicle;
  }

  @Post(':country/plate/:plate')
  public async createVehicleByPlate(
    @Param('country') country: string,
    @Param('plate') plate: string,
    @Body() vehicle: CreateVehicleByPlateDto,
  ) {
    this.logger.log(`createVehicleByPlate: ${country} ${plate}`);
    const createdVehicle = await this.vehiclesService.createByPlate(country, plate, vehicle);
    return new SuccessResponseDto(createdVehicle);
  }

  @Get(':country/plate/:plate')
  async getVehicleByPlate(@Param('country') country: string, @Param('plate') plate: string) {
    this.logger.log(`getVehicleByPlate: ${country} ${plate}`);
    const data = await this.vehiclesService.findByPlate(country, plate);
    return new SuccessResponseDto(data);
  }

  @Get('/brands')
  public async getBrands() {
    this.logger.log('getBrands');
    const data = await this.vehiclesService.getBrands();
    return new SuccessResponseDto(data);
  }

  @Get('/brands/:brand/years/:year/models')
  public async getModelsByBrand(@Param('brand') brand: string, @Param('year') year: string) {
    this.logger.log(`getModelsByBrand: ${brand}`);
    const data = await this.vehiclesService.getModelsByBrand(brand, year);
    return new SuccessResponseDto(data);
  }

  @Get('/brands/:brand/years')
  public async getYearsByModel(@Param('brand') brand: string) {
    this.logger.log(`getYearsByModel: ${brand}`);
    const data = await this.vehiclesService.getYearsByModel(brand);
    return new SuccessResponseDto(data);
  }

  @Get('/brands/:brand/models/:model/years/:year/versions')
  public async getVersionsByYear(
    @Param('brand') brand: string,
    @Param('model') model: string,
    @Param('year') year: string,
  ) {
    this.logger.log(`getVersionsByYear: ${brand} ${model} ${year}`);
    const data = await this.vehiclesService.getVersionsByYear(brand, model, year);
    return new SuccessResponseDto(data);
  }

  @Get(':country/plate/:plateId/history')
  public async getVehicleHistory(@Param('country') country: string, @Param('plateId') plateId: string) {
    this.logger.log(`getVehicleHistory: ${country} ${plateId}`);
    const data = await this.vehiclesService.getHistoryByPlate(country, plateId);
    return new SuccessResponseDto(data);
  }
}
