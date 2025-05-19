import { Expose, Transform, Type } from 'class-transformer';
import { TiresDomain } from 'src/shared/domain/tires.domain';
import { appConstants } from 'src/config/app.constants';
import { IsInt, IsString } from 'class-validator';

export class ResponseWidthDto {
  widths: number[];

  constructor(widths: number[]) {
    this.widths = widths;
  }
}

export class ResponseProfileDto {
  profiles: number[];

  constructor(profiles: number[]) {
    this.profiles = profiles;
  }
}

export class ResponseRimDto {
  rims: number[];

  constructor(rims: number[]) {
    this.rims = rims;
  }
}

export class ComboItemDto {
  id: number;
  serviceCode: string;
  serviceDescription: string;
  price: number;
  applyToCar: boolean;
  sortOrder?: number;
  isRecommended: boolean;
  isOptional: boolean;
}

export class PlpTiresResponseDto {
  comboItems: ComboItemDto[];
  tires: TireResponseDto[];
}

export class PdpTiresResponseDto {
  comboItems: ComboItemDto[];
  tire: TireResponseDto;
}

export class TireResponseDto {
  static generateMediaUrl(sku: string, type: 'image' | 'audio' | '360', view: string = ''): string {
    const baseUrl = `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.COMPLEMENTS_PATH}/${sku}`;

    switch (type) {
      case 'image':
        return `${baseUrl}/fotos/${view}.jpg`;
      case 'audio':
        return `${baseUrl}/audios/audio.mp3`;
      case '360':
        return `${baseUrl}/360/index.html`;
      default:
        return baseUrl;
    }
  }

  @Expose()
  id: string;

  @Expose()
  @Transform(({ obj }) => ({
    id: obj.productTire.brand.id,
    name: obj.productTire.brand.name || 'Sin marca',
    description: obj.productTire.brand.description || '',
    logo: `${appConstants.BASE_URL_STATIC_FILES}/static/images/brands/${obj.productTire.brand.name.toUpperCase()}.png`,
    hasCorporateAgreement: obj.productTire.brand.hasCorporateAgreement || false,
  }))
  brand: {
    id: string;
    name: string;
    description: string;
    logo: string;
    hasCorporateAgreement: boolean;
  };

  @Expose()
  @Transform(({ obj }) => obj.productTire.emotionalDescription || '')
  emotionalDescription: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.design || '')
  design: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'frente'))
  image: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'frente'))
  imageFront: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'lado'))
  imageSide: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'diagonal'))
  imageDiagonal: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'detalle'))
  imageDetail: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'image', 'surco'))
  imageTread: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, 'audio'))
  audio: string;

  @Expose()
  @Transform(({ obj }) => TireResponseDto.generateMediaUrl(obj.id, '360'))
  image360: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.tireConstruction || '')
  tireConstruction: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.width || '')
  width: number;

  @Expose()
  @Transform(({ obj }) => obj.productTire.profile || '')
  profile: number;

  @Expose()
  @Transform(({ obj }) => obj.productTire.rim || '')
  rim: number;

  @Expose()
  @Transform(({ obj }) => obj.productTire.speedIndex || '')
  speedIndex: string;

  @Expose()
  @Transform(({ obj }) => TiresDomain.speedIndex[obj.productTire.speedIndex] || '')
  speedIndexEquivalence: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.loadIndex || '')
  loadIndex: string;

  @Expose()
  @Transform(({ obj }) => TiresDomain.loadIndex[obj.productTire.loadIndex] || '')
  loadIndexEquivalence: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.utqgScore || null)
  utqgScore: string | null;

  @Expose()
  @Transform(({ obj }) => obj.productTire.percentageOnRoad || null)
  percentageOnRoad: number;

  @Expose()
  @Transform(({ obj }) => obj.productTire.percentageOffRoad || null)
  percentageOffRoad: number;

  @Expose()
  @Transform(
    ({ obj }) => `${obj.productTire.percentageOnRoad} % ON-ROAD / ${obj.productTire.percentageOffRoad} % OFF-ROAD`,
  )
  terrainType: string;

  @Expose()
  @Transform(({ obj }) => obj.productTire.useCar || false)
  useCar: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.useSuv || false)
  useSuv: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.useSport || false)
  useSport: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.usePickup || false)
  usePickup: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.useCommercial || false)
  useCommercial: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.highwayCompatible || null)
  highwayCompatible: boolean | null;

  @Expose()
  @Transform(({ obj }) => obj.productTire.reinforced || false)
  reinforced: boolean;

  @Expose()
  @Transform(({ obj }) => obj.productTire.runFlat || null)
  runFlat: boolean | null;

  @Expose()
  price: number;

  @Expose()
  priceInCombo: number;

  @Expose()
  @Transform(({ obj }) => obj.productTire.warrantyLeon || false)
  warrantyLeon: boolean;

  @Expose()
  @Transform(({ obj }) => obj.stocks.reduce((total, stock) => total + parseInt(stock.stockReal), 0))
  stockAvailable: number;

  @Expose()
  createdAt: Date;
}

export class MeasuresByWheelsizeDto {
  isOriginalEquipment: boolean;
  hasDifferentMeasure: boolean;
  front: WheelMeasureDto | null;
  rear: WheelMeasureDto | null;

  constructor(measure: any) {
    this.isOriginalEquipment = measure.is_stock ?? false;
    this.hasDifferentMeasure = measure.showing_fp_only ?? false;
    this.front = measure.front ? new WheelMeasureDto(measure.front) : null;
    this.rear = measure.rear ? new WheelMeasureDto(measure.rear) : null;
  }
}

export class WheelMeasureDto {
  width: number;
  profile: number;
  rim: number;
  tire?: string;

  constructor(data: any) {
    this.width = data.tire_width_mm;
    this.profile = data.tire_aspect_ratio;
    this.rim = data.rim_diameter;
    this.tire = data.tire || '';
  }
}

export class GetTiresDoubleDto {
  @Type(() => Number)
  @IsInt()
  frontWidth: number;

  @Type(() => Number)
  @IsInt()
  frontProfile: number;

  @Type(() => Number)
  @IsInt()
  frontRim: number;

  @Type(() => Number)
  @IsInt()
  rearWidth: number;

  @Type(() => Number)
  @IsInt()
  rearProfile: number;

  @Type(() => Number)
  @IsInt()
  rearRim: number;

  @IsString()
  storeId: string;

  @IsString()
  channel: string;
}
