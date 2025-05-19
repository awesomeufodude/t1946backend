import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { plainToInstance } from 'class-transformer';
import { Combo } from 'src/infrastructure/database/entities/combo.entity';
import { ProductTire } from 'src/infrastructure/database/entities/product-tire.entity';
import { Product } from 'src/infrastructure/database/entities/product.entity';
import { ProductTireRepository } from 'src/infrastructure/database/repositories/product-tire.repository';
import { ProductRepository } from 'src/infrastructure/database/repositories/product.repository';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import {
  ComboItemDto,
  MeasuresByWheelsizeDto,
  PdpTiresResponseDto,
  PlpTiresResponseDto,
  ResponseProfileDto,
  ResponseRimDto,
  ResponseWidthDto,
  TireResponseDto,
} from './tires.dto';
import { promises as fs } from 'fs';
import { WheelSizeService } from 'src/infrastructure/wheelsize/wheelsize.service';

@Injectable()
export class TiresService {
  constructor(
    private readonly logger: Logger,
    private readonly productTireRepository: ProductTireRepository,
    private readonly productRepository: ProductRepository,
    private readonly wheelSizeService: WheelSizeService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getAllWidthsByTires() {
    const cacheKey = 'all_widths';
    const cachedData = await this.cacheManager.get<number[]>(cacheKey);
    if (cachedData) {
      this.logger.log('obtengo datos de cache de widths');
      return new ResponseWidthDto(cachedData);
    }

    this.logger.log('no obtengo datos de cache de widths');
    const data = await this.handleRepositoryResponse(
      () => this.productTireRepository.findAllWidths(),
      ResponseWidthDto,
    );
    await this.cacheManager.set(cacheKey, data.widths);
    return data;
  }

  async getProfilesByWidth(width: number) {
    const cacheKey = `profiles_width_${width}`;
    const cachedData = await this.cacheManager.get<number[]>(cacheKey);
    if (cachedData) {
      this.logger.log(`obtengo datos de cache de profiles por width: ${width}`);
      return new ResponseProfileDto(cachedData);
    }

    this.logger.log(`no obtengo datos de cache de profiles por width: ${width}`);
    const data = await this.handleRepositoryResponse(
      () => this.productTireRepository.findProfilesByWidth(width),
      ResponseProfileDto,
    );
    await this.cacheManager.set(cacheKey, data.profiles);
    return data;
  }

  async getRimsByWidthAndProfile(width: number, profile: number) {
    const cacheKey = `rims_width_${width}_profile_${profile}`;
    const cachedData = await this.cacheManager.get<number[]>(cacheKey);
    if (cachedData) {
      this.logger.log(`obtengo datos de cache de rims por width: ${width} y profile: ${profile}`);
      return new ResponseRimDto(cachedData);
    }

    this.logger.log(`no obtengo datos de cache de rims por width: ${width} y profile: ${profile}`);
    const data = await this.handleRepositoryResponse(
      () => this.productTireRepository.findRimsByWidthAndProfile(width, profile),
      ResponseRimDto,
    );
    await this.cacheManager.set(cacheKey, data.rims);
    return data;
  }

  async getTireBySku(sku: string, storeId: string, channel: string): Promise<PdpTiresResponseDto> {
    const product = this.castProduct(await this.productRepository.findTireBySku(sku, storeId));
    const tireDto = plainToInstance(TireResponseDto, product, { excludeExtraneousValues: true });
    tireDto.price = SalesDomain.getPriceForChannel(product.productPrices[0], channel);
    let comboItemsDto = [];
    if (product?.productTire) {
      const productCombo = await this.productRepository.getProductCombo(storeId, tireDto.rim);
      comboItemsDto = this.getComboItems(productCombo, channel);
      const priceCombo = this.getPriceCombo(productCombo, channel);
      this.logger.log(`rim: ${tireDto.rim} priceCombo: ${JSON.stringify(priceCombo)}`);
      tireDto.priceInCombo = Number(tireDto.price) + Number(priceCombo);
    }
    const pdpResponseDto = {
      tire: tireDto,
      comboItems: comboItemsDto,
    };
    return pdpResponseDto;
  }

  async getTiresByMeasure(
    width: number,
    profile: number,
    rim: number,
    storeId: string,
    channel: string,
  ): Promise<PlpTiresResponseDto> {
    this.logger.log('getTiresByMeasure', { width, profile, rim, storeId, channel });
    const tires = await this.productRepository.getTiresByMeasures(width, profile, rim, storeId);

    const productCombo = await this.productRepository.getProductCombo(storeId, rim);
    const comboItems = this.getComboItems(productCombo, channel);
    const priceCombo = this.getPriceCombo(productCombo, channel);
    this.logger.log(`rim: ${rim} priceCombo: ${JSON.stringify(priceCombo)}`);
    const tiresWithTotalPrice = tires.map((tire) => {
      const product = this.castProduct(tire);
      const tireDto = plainToInstance(TireResponseDto, product, { excludeExtraneousValues: true });
      tireDto.price = SalesDomain.getPriceForChannel(product.productPrices[0], channel);
      tireDto.priceInCombo = Number(tireDto.price) + Number(priceCombo);
      return tireDto;
    });
    const plpResponseDto: PlpTiresResponseDto = {
      tires: tiresWithTotalPrice,
      comboItems,
    };
    return plpResponseDto;
  }

  private castProduct(tire: ProductTire): Product {
    const product = tire.product;
    product.productTire = tire;
    return product;
  }
  private getComboItems(productCombo: Combo, channel: string): ComboItemDto[] {
    if (!productCombo?.comboItems) {
      return [];
    }
    const comboItemsDto: ComboItemDto[] = productCombo.comboItems.map((item) => {
      const comboItemDto: ComboItemDto = {
        id: item.id,
        serviceCode: item.service?.code,
        serviceDescription: item.service?.description,
        price: SalesDomain.getPriceForChannel(item.prices[0], channel),
        applyToCar: item.service?.applyToCar,
        isRecommended: item.isRecommended,
        isOptional: item.isOptional,
      };
      return comboItemDto;
    });
    return comboItemsDto;
  }

  private getPriceCombo(productCombo: any, channel: string): number {
    let priceCombo = 0;
    if (productCombo) {
      priceCombo = productCombo.comboItems?.reduce((acc, item) => {
        const itemPrice = SalesDomain.getPriceForChannel(item.prices[0], channel);
        return acc + itemPrice;
      }, 0);
    }
    return priceCombo;
  }

  private async handleRepositoryResponse(queryFn: () => Promise<any>, DtoClass: any) {
    const result = await queryFn();
    if (!result) {
      this.logger.warn(`No se encontró información en la base de datos`);
      return [];
    }
    return new DtoClass(result);
  }
  async getTireCharacteristics() {
    const characteristicsDataPath = 'src/modules/products/tires/tire-characteristics.json';
    const data = await fs.readFile(characteristicsDataPath, 'utf-8');
    return JSON.parse(data);
  }

  async getMeasures(brand: string, model: string, year: string, modification: string) {
    this.logger.log(`getMeasures: brand=${brand}, model=${model}, year=${year}, modification=${modification}`);
    const cacheKey = `measures-${brand}-${model}-${year}-${modification}`;
    const cachedData = await this.cacheManager.get<MeasuresByWheelsizeDto[]>(cacheKey);

    if (cachedData) {
      this.logger.log('obtengo datos de cache de measures');
      return cachedData;
    }

    this.logger.log('no obtengo datos de cache de measures');
    const measures = await this.wheelSizeService.getMeasures(brand, model, year, modification);

    if (!measures || measures.length === 0) {
      throw new NotFoundException('Measures not found');
    }

    const measuresDto = measures.flatMap((measure) => measure.wheels.map((wheel) => new MeasuresByWheelsizeDto(wheel)));
    await this.cacheManager.set(cacheKey, measuresDto);

    return measuresDto;
  }

  async getTiresDouble(query: any) {
    this.logger.log('getTiresDouble', query);

    const { frontWidth, frontProfile, frontRim, rearWidth, rearProfile, rearRim, storeId, channel } = query;

    if (!frontWidth || !frontProfile || !frontRim || !rearWidth || !rearProfile || !rearRim || !storeId || !channel) {
      throw new BadRequestException('Missing required query parameters');
    }

    const rear = await this.getTiresByMeasure(rearWidth, rearProfile, rearRim, storeId, channel);
    const front = await this.getTiresByMeasure(frontWidth, frontProfile, frontRim, storeId, channel);

    const groupedTires = this.groupTiresDouble(rear.tires, front.tires);

    return { tires: groupedTires, comboItems: { rear: rear.comboItems ?? [], front: front.comboItems ?? [] } };
  }

  private groupTiresDouble(rearTires: any[], frontTires: any[]) {
    const groupedMap = new Map<string, { rear: TireResponseDto | null; front: TireResponseDto | null }>();

    rearTires.forEach((tire) => {
      const key = `${tire.design}-${tire.brand.name}`;
      groupedMap.set(key, { rear: tire, front: null });
    });

    frontTires.forEach((tire) => {
      const key = `${tire.design}-${tire.brand.name}`;
      const existing = groupedMap.get(key);

      if (existing) {
        existing.front = tire;
      } else {
        groupedMap.set(key, { rear: null, front: tire });
      }
    });

    return Array.from(groupedMap.values());
  }
}
