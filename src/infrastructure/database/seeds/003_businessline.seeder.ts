import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { BusinessLine } from '../entities/business-line.entity';
import { Brand } from '../entities/brand.entity';
import { appConstants } from 'src/config/app.constants';
import { ROUTES } from 'src/modules/common/constants';

export class BusinessLineSeeder implements Seeder {
  private readonly TIRE = 'Neumáticos';
  private readonly baseUrl = `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.SALES_MENU_PATH}/`;

  async run(dataSource: DataSource): Promise<void> {
    const businessLineRepository = dataSource.getRepository(BusinessLine);
    const brandRepostirory = dataSource.getRepository(Brand);

    // Load business lines
    const businessLines = await this.loadBusinessLines(businessLineRepository);
    await businessLineRepository.save(businessLines);

    // Load brands
    const brands = await this.loadBrands(businessLines, brandRepostirory);
    await brandRepostirory.save(brands);
  }

  private async loadBusinessLines(businessLineRepository: Repository<BusinessLine>): Promise<BusinessLine[]> {
    const businessLinesData = [
      {
        name: 'Neumáticos',
        description: 'Neumáticos para todo tipo de vehículos',
        image: this.baseUrl + 'tires.svg',
        url: ROUTES.SALE.TIRES_SEARCH_BY_MEASURE,
        order: 1,
        code: 'TIRES',
        active: true,
      },
      {
        name: 'Baterías',
        description: 'Baterías de alto rendimiento para todo tipo de vehículos',
        image: this.baseUrl + 'batteries.svg',
        url: null,
        order: 2,
        code: 'BATTERY',
      },
      {
        name: 'Frenos',
        description: 'Sistemas de frenos y repuestos para mayor seguridad',
        image: this.baseUrl + 'brakes.svg',
        url: null,
        order: 3,
        code: 'BRAKES',
      },
      {
        name: 'Afinamiento',
        description: 'Mantenimiento y afinamiento para mejorar el rendimiento',
        image: this.baseUrl + 'tuning.svg',
        url: null,
        order: 4,
        code: 'TUNING',
      },
      {
        name: 'Alineación',
        description: 'Ajuste de dirección y alineación de ruedas',
        image: this.baseUrl + 'alignment.svg',
        url: null,
        order: 5,
        code: 'ALIGNMENT',
      },
      {
        name: 'Balanceo',
        description: 'Balanceo de ruedas para una conducción estable',
        image: this.baseUrl + 'balancing.svg',
        url: null,
        order: 6,
        code: 'BALANCING',
      },
      {
        name: 'Montaje',
        description: 'Instalación profesional de neumáticos y repuestos',
        image: this.baseUrl + 'mounting.svg',
        url: null,
        order: 7,
        code: 'MOUNTING',
      },
      {
        name: 'Tren Delantero',
        description: 'Revisión y mantenimiento del tren delantero',
        image: this.baseUrl + 'front_axle.svg',
        url: null,
        order: 8,
        code: 'FRONT_AXLE',
      },
      {
        name: 'Geometría',
        description: 'Ajuste y calibración de la geometría del vehículo',
        image: this.baseUrl + 'geometry.svg',
        url: null,
        order: 9,
        code: 'GEOMETRY',
      },
      {
        name: 'Eléctrico',
        description: 'Revisión y reparación del sistema eléctrico del vehículo',
        image: this.baseUrl + 'electrical.svg',
        url: null,
        order: 10,
        code: 'ELECTRICAL',
      },
      {
        name: 'Accesorios',
        description: 'Accesorios para mejorar la funcionalidad y estética del vehículo',
        image: this.baseUrl + 'accessories.svg',
        url: null,
        order: 11,
        code: 'ACCESSORIES',
      },
      {
        name: 'Filtros',
        description: 'Filtros de aire, aceite y combustible para un mejor rendimiento',
        image: this.baseUrl + 'filters.svg',
        url: null,
        order: 12,
        code: 'FILTERS',
      },
      {
        name: 'Mantención de KM',
        description: 'Servicio de mantención según kilometraje del vehículo',
        image: this.baseUrl + 'km_maintenance.svg',
        url: null,
        order: 13,
        code: 'KM_MAINTENANCE',
      },
      {
        name: 'Amortiguadores',
        description: 'Reemplazo y revisión de amortiguadores',
        image: this.baseUrl + 'shock_absorbers.svg',
        url: null,
        order: 14,
        code: 'SHOCK_ABSORBERS',
      },
      {
        name: 'Higienización',
        description: 'Limpieza profunda y desinfección del vehículo',
        image: this.baseUrl + 'hygiene.svg',
        url: null,
        order: 15,
        code: 'HYGIENIZATION',
      },
      {
        name: 'Fluidos',
        description: 'Revisión y cambio de líquidos esenciales del vehículo',
        image: this.baseUrl + 'fluids.svg',
        url: null,
        order: 16,
        code: 'FLUIDS',
      },
      {
        name: 'Garantías',
        description: 'Cobertura y garantía en repuestos y servicios',
        image: this.baseUrl + 'warranty.svg',
        url: null,
        order: 17,
        code: 'WARRANTY',
      },
      {
        name: 'Cambio de Aceite',
        description: 'Cambio de aceite con productos de alta calidad',
        image: this.baseUrl + 'oil_change.svg',
        url: null,
        order: 18,
        code: 'OIL_CHANGE',
      },
      {
        name: 'Revisión de Seguridad',
        description: 'Inspección completa para garantizar la seguridad del vehículo',
        image: this.baseUrl + 'safety_check.svg',
        url: null,
        order: 19,
        code: 'SECURITY_CHECK',
        active: true,
      },
    ];

    const businessLines = [];
    for (const businessLineData of businessLinesData) {
      const existingBusinessLine = await businessLineRepository.findOne({
        where: { code: businessLineData.code },
      });

      if (!existingBusinessLine) {
        const businessLine = new BusinessLine();
        businessLine.name = businessLineData.name;
        businessLine.description = businessLineData.description;
        businessLine.image = businessLineData.image;
        businessLine.url = businessLineData.url;
        businessLine.order = businessLineData.order;
        businessLine.code = businessLineData.code;
        businessLine.active = businessLineData.active || false;
        businessLines.push(businessLine);
      }
    }

    return businessLines;
  }

  private async loadBrands(businessLines: BusinessLine[], brandRepostirory: Repository<Brand>): Promise<Brand[]> {
    const brandValues = [];
    const brands = [
      { id: 1, name: 'GOODYEAR' },
      { id: 2, name: 'MICHELIN' },
      { id: 3, name: 'BF GOODRICH' },
      { id: 4, name: 'UNIROYAL' },
      { id: 5, name: 'ROADSTONE' },
      { id: 13, name: 'GENERAL' },
      { id: 17, name: 'PIRELLI' },
      { id: 21, name: 'CONTINENTAL' },
      { id: 28, name: 'BRIDGESTONE' },
      { id: 72, name: 'INTERSTATE' },
      { id: 82, name: 'FIRESTONE' },
      { id: 98, name: 'JOYROAD' },
      { id: 101, name: 'TRACMAX' },
      { id: 107, name: 'RYDANZ' },
      { id: 110, name: 'ROADCRUZA' },
    ];

    for (const brand of brands) {
      const existingBrand = await brandRepostirory.findOne({
        where: { id: brand.id },
        relations: ['businessLines'],
      });

      if (!existingBrand) {
        const brandValue = new Brand();
        brandValue.id = brand.id;
        brandValue.name = brand.name;

        const businessLine = businessLines.find((line) => line.name === this.TIRE);
        if (businessLine) {
          brandValue.businessLines = [businessLine];
        }

        await brandRepostirory.save(brandValue);
      }
    }

    return brandValues;
  }
}
