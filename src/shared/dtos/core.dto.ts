import { plainToInstance } from 'class-transformer';
import { appConstants } from 'src/config/app.constants';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { User } from 'src/infrastructure/database/entities/user.entity';
import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { BrandDto, ModelDto, VersionDto } from 'src/modules/core/vehicles/vehicles.dto';
import { TireResponseDto } from 'src/modules/products/tires/tires.dto';
import { SalesDomain } from '../domain/sales.domain';

export namespace CoreDtos {
  export class VehicleDto {
    id: string;
    color: string;
    year: number;
    brand: BrandDto;
    model: ModelDto;
    version: VersionDto | null;
    plate: string;
    plateCountry?: string | null;
    catalogId: string;
    odometer?: number;
    odometerUpdateDate?: Date;
    imageModel: string;
    imageBrand: string;

    constructor(vehicle: Vehicle) {
      this.id = vehicle?.id;
      this.color = vehicle?.color;
      this.year = vehicle?.vehicleCatalog?.year;
      this.brand = vehicle?.vehicleCatalog?.brand;
      this.model = vehicle?.vehicleCatalog?.model;
      this.version = vehicle?.vehicleCatalog?.version;
      this.odometer = vehicle?.odometer;
      this.odometerUpdateDate = vehicle?.odometerUpdateDate;
      this.plate = vehicle?.plate;
      this.plateCountry = vehicle?.plateCountry;
      this.catalogId = vehicle?.vehicleCatalog?.id;
      this.imageModel = 'https://cdn.wheel-size.com/automobile/body/nissan-qashqai-2024-2025-1717052568.5719864.jpg'; // se pone en duro porque no se ha definido la parte de wheel-size
      this.imageBrand = 'https://cdn.wheel-size.com/automobile/manufacturer/nissan-1632742769.6952765.png'; // se pone en duro porque no se ha definido la parte de wheel-size
    }
  }

  export class CustomerDto {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phoneNumber: number;
    phoneZone: number;

    constructor(customer: Customer) {
      this.id = customer?.id || '';
      this.name = customer?.customerPeople?.name || '';
      this.lastname = customer?.customerPeople?.lastname || '';
      this.email = customer?.customerPeople?.email || '';
      this.phoneNumber = customer?.customerPeople?.phoneNumber || 0;
      this.phoneZone = customer?.customerPeople?.phoneZone || 0;
    }
  }

  export class LeadDto {
    id: string;
    name: string;
    lastname: string;
    email: string;
    phoneNumber: number;
    phoneZone: number;

    constructor(lead: any) {
      this.id = lead?.id || '';
      this.name = lead?.name || '';
      this.lastname = lead?.lastname || '';
      this.email = lead?.email || '';
      this.phoneNumber = lead?.phoneNumber || 0;
      this.phoneZone = lead?.phoneZone || 0;
    }
  }

  export class UserDto {
    id: string;
    rut: string;
    name: string;
    lastname: string;

    constructor(user: User) {
      this.id = user.id;
      this.rut = user.rut;
      this.name = user.name;
      this.lastname = user.lastname;
    }
  }

  export class BudgetDto {
    id: number;
    subtotal: string;
    iva: string;
    total: string;
    sent: number;
    sentAt: Date;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    appointments?: AppointmentDto[];
    budgetItems: BudgetItemsDto[];
    searchHistory?: SearchHistoryDto | null;
    constructor(budget: any) {
      this.id = budget.id;
      this.subtotal = budget.subtotal;
      this.iva = budget.iva;
      this.total = budget.total;
      this.sent = budget.sent;
      this.sentAt = budget.sentAt;
      this.createdAt = budget.createdAt;
      this.updatedAt = budget.updatedAt;
      this.status = budget.status;
      this.budgetItems = budget.budgetItems?.map((item: any) => new BudgetItemsDto(item));
      this.appointments = budget.appointments?.map((appointment: any) => new AppointmentDto(appointment));
      this.searchHistory =
        Array.isArray(budget.searchHistories) && budget.searchHistories.length > 0
          ? new SearchHistoryDto(budget.searchHistories)
          : null;
    }
  }

  export class AppointmentDto {
    id: string;
    appointmentDate: Date;
    mode: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(appointment: any) {
      this.id = appointment.id;
      this.appointmentDate = appointment.appointmentDate;
      this.mode = appointment.mode;
      this.status = appointment.status;
      this.createdAt = appointment.createdAt;
      this.updatedAt = appointment.updatedAt;
    }
  }

  export class BudgetItemsDto {
    id: number;
    itemType: string;
    itemTypeId: string;
    itemId: string;
    sortOrder?: number;
    quantity: number;
    unitPrice: number;
    isChecked: boolean;
    itemComboId: string;
    data: ItemDataDto | null;
    createdAt: Date;
    updatedAt: Date;
    businessLine?: {
      id: number;
      description: string;
    };
    budgetServicesItems?: BudgetServicesItem[];

    constructor(budgetItem: any) {
      this.id = budgetItem.id;
      this.itemType = budgetItem.itemType;
      this.itemTypeId = budgetItem.itemTypeId;
      this.itemId = budgetItem.itemId;
      this.sortOrder = budgetItem.data?.sortOrder;
      this.quantity = budgetItem.quantity;
      this.unitPrice = budgetItem.unitPrice;
      this.isChecked = budgetItem.isChecked;
      this.itemComboId = budgetItem.itemComboId;
      this.data = budgetItem.data ? new ItemDataDto(budgetItem.data, budgetItem.itemType) : null;
      this.budgetServicesItems = (budgetItem.budgetServicesItems ?? []).map((item) => new BudgetServicesItem(item));
      if (budgetItem.itemType === SalesDomain.ItemType.PRODUCT && budgetItem.data) {
        const { businessLine } = budgetItem.data;
        if (businessLine) {
          this.businessLine = new BusinessLineDto(businessLine);
        }
      }

      this.createdAt = budgetItem.createdAt;
      this.updatedAt = budgetItem.updatedAt;
    }
  }

  export class BudgetServicesItem {
    id: number;

    statusCode: string;
    statusDescription: string;
    assignedUser: UserDto;
    serviceItem: {
      id: number;
      name: string;
      description: string;
      image: string;
      serviceCode: string;
      order: number;
      code: string;
    };

    constructor(item: any) {
      console.log(item);
      this.id = item.id;
      this.statusCode = item.status.code;
      this.statusDescription = item.status.description;
      this.assignedUser = new UserDto(item.assignedUser || {});
      this.serviceItem = {
        id: item.serviceItem.id,
        name: item.serviceItem.name,
        description: item.serviceItem.description,
        image: item.serviceItem.image,
        serviceCode: item.serviceItem.serviceCode,
        order: item.serviceItem.order,
        code: item.serviceItem.code,
      };
    }
  }

  export class BusinessLineDto {
    id: number;
    name: string;
    description: string;

    constructor(businessLine: any) {
      this.id = businessLine.id;
      this.description = businessLine.description;
      this.name = businessLine.name;
    }
  }

  export class ItemDataDto {
    id: string;

    // Campos específicos de servicios
    code?: string;
    description?: string;
    subcategoryId?: number;
    applyToCar?: boolean;
    fixedQuantity?: number | null;
    explanationTitle?: string;
    explanationDescription?: string;
    explanationVideo?: string;
    createdAt?: string;
    updatedAt?: string;

    // Campos específicos de productos (neumáticos)
    brand?: {
      id: string;
      name: string;
      description: string;
      logo: string;
      hasCorporateAgreement: boolean;
    };
    emotionalDescription?: string;
    design?: string;
    image?: string;
    imageFront?: string;
    imageSide?: string;
    imageDiagonal?: string;
    imageDetail?: string;
    imageTread?: string;
    image360?: string;
    audio?: string;
    tireConstruction?: string;
    width?: number;
    profile?: number;
    rim?: number;
    speedIndex?: string;
    speedIndexEquivalence?: string;
    loadIndex?: string;
    loadIndexEquivalence?: string;
    utqgScore?: string;
    percentageOffRoad?: number;
    percentageOnRoad?: number;
    terrainType?: string;
    useCar?: boolean;
    useSuv?: boolean;
    useSport?: boolean;
    usePickup?: boolean;
    useCommercial?: boolean;
    highwayCompatible?: boolean;
    reinforced?: boolean;
    runFlat?: boolean;
    warrantyLeon?: boolean;
    price?: number;
    priceInCombo?: number;
    stockAvailable?: number;
    isRecommended?: boolean;
    isOptional?: boolean;

    constructor(budgetItemData: any, itemType: string) {
      this.id = budgetItemData.id;

      if (itemType === SalesDomain.ItemType.PRODUCT) {
        const tireData = plainToInstance(TireResponseDto, budgetItemData || {});

        this.brand = tireData.brand;
        this.emotionalDescription = tireData.emotionalDescription;
        this.design = tireData.design;
        this.image = tireData.image;
        this.imageFront = tireData.imageFront;
        this.imageSide = tireData.imageSide;
        this.imageDiagonal = tireData.imageDiagonal;
        this.imageDetail = tireData.imageDetail;
        this.imageTread = tireData.imageTread;
        this.image360 = tireData.image360;
        this.audio = tireData.audio;
        this.tireConstruction = tireData.tireConstruction;
        this.width = tireData.width;
        this.profile = tireData.profile;
        this.rim = tireData.rim;
        this.speedIndex = tireData.speedIndex;
        this.speedIndexEquivalence = tireData.speedIndexEquivalence;
        this.loadIndex = tireData.loadIndex;
        this.loadIndexEquivalence = tireData.loadIndexEquivalence;
        this.utqgScore = tireData.utqgScore;
        this.percentageOffRoad = tireData.percentageOffRoad || 0;
        this.percentageOnRoad = tireData.percentageOnRoad || 0;
        this.terrainType = tireData.terrainType;
        this.useCar = tireData.useCar;
        this.useSuv = tireData.useSuv;
        this.useSport = tireData.useSport;
        this.usePickup = tireData.usePickup;
        this.useCommercial = tireData.useCommercial;
        this.highwayCompatible = tireData.highwayCompatible;
        this.reinforced = tireData.reinforced;
        this.runFlat = tireData.runFlat;
        this.warrantyLeon = tireData.warrantyLeon;
        this.price = tireData.price;
        this.priceInCombo = tireData.priceInCombo;
        this.stockAvailable = tireData.stockAvailable;
      } else if (itemType === SalesDomain.ItemType.SERVICE) {
        this.initializeServiceData(budgetItemData);
      }
    }

    private initializeServiceData(budgetItemData: any): void {
      const {
        code,
        description,
        subcategoryId,
        applyToCar,
        fixedQuantity,
        explanationTitle,
        explanationDescription,
        createdAt,
        updatedAt,
        explanationVideo = generateVideoUrl(code),
        isRecommended,
        isOptional,
      } = budgetItemData;

      Object.assign(this, {
        code,
        description,
        subcategoryId,
        applyToCar,
        fixedQuantity,
        explanationTitle,
        explanationDescription,
        explanationVideo,
        isRecommended,
        isOptional,
        createdAt,
        updatedAt,
      });
    }
  }

  export class ItemData {
    id: string;
    sku: string;
    brand: {
      id: string;
      businessLine: {
        id: number;
        description: string;
      };
      name: string;
      description: string;
      logo: string;
      hasCorporateAgreement: boolean;
    };
    emotionalDescription: string;
    design: string;
    image: string;
    imageFront: string;
    imageSide: string;
    imageDiagonal: string;
    imageDetail: string;
    imageTread: string;
    image360: string;
    audio: string;
    tireConstruction: string;
    width: string;
    profile: string;
    rim: string;
    speedIndex: string;
    speedIndexEquivalence: string;
    loadIndex: string;
    loadIndexEquivalence: string;
    utqgScore: string;
    percentage_on_road: number;
    percentage_off_road: number;
    terrain_type: string;
    useCar: boolean;
    useSuv: boolean;
    useSport: boolean;
    usePickup: boolean;
    useCommercial: boolean;
    highwayCompatible: boolean;
    reinforced: boolean;
    runFlat: boolean;
    warrantyLeon: boolean;
    price: number;
    priceInCombo: number;
    stockAvailable: number;
  }

  export class UpdateStatusServiceItemDto {
    id: number;
    statusCode: string;
    statusDescription: string;
    assignedUser: CoreDtos.UserDto;
    serviceItem: {
      id: number;
      name: string;
      description: string;
      image: string;
      serviceCode: string;
      order: number;
    };

    constructor(item: any) {
      this.id = item.id;
      this.statusCode = item.status.code;
      this.statusDescription = item.status.description;
      this.assignedUser = new CoreDtos.UserDto(item.assignedUser || {});
      this.serviceItem = {
        id: item.serviceItem.id,
        name: item.serviceItem.name,
        description: item.serviceItem.description,
        image: item.serviceItem.image,
        serviceCode: item.serviceItem.serviceCode,
        order: item.serviceItem.order,
      };
    }
  }

  export class MeasureTireDto {
    width: number;
    profile: number;
    rim: number;
  }

  export class SearchHistoryDto {
    id: number;
    doublePlp: boolean;
    searchCriteria: any;
    measureDouble: {
      front?: CoreDtos.MeasureTireDto;
      rear?: CoreDtos.MeasureTireDto;
    };

    constructor(searchHistory: any) {
      this.id = searchHistory[0].id;
      this.doublePlp = searchHistory[0].doublePlp;
      this.searchCriteria = searchHistory[0].searchCriteria;
      this.measureDouble = {
        front: {
          width: searchHistory[0].frontWidth,
          profile: searchHistory[0].frontProfile,
          rim: searchHistory[0].frontRim,
        },
        rear: {
          width: searchHistory[0].rearWidth,
          profile: searchHistory[0].rearProfile,
          rim: searchHistory[0].rearRim,
        },
      };
    }
  }

  function generateVideoUrl(code: string): string {
    return `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.SERVICES_PATH}/${code}/video.mp4`;
  }
}
