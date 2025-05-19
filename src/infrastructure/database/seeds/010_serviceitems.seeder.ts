import { DataSource, EntityManager } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { ServiceItemsStatuses } from '../entities/service-items-statuses';
import { appConstants } from 'src/config/app.constants';
import { ServiceItems } from '../entities/service-items ';
import { Service } from '../entities/service.entity';

export class ServiceItemSeeder implements Seeder {
  private readonly baseUrl = `${appConstants.BASE_URL_STATIC_FILES}/${appConstants.SALES_MENU_PATH}/`;

  async run(dataSource: DataSource): Promise<void> {
    // Status Service Items
    await this.statusServiceItems(dataSource.createEntityManager());

    // Service Items
    await this.serviceItems(dataSource.createEntityManager());
  }

  private async statusServiceItems(manager: EntityManager): Promise<void> {
    const statusServiceItems = [
      { code: 'OK', description: 'OK' },
      { code: 'PREV', description: 'Preventivo' },
      { code: 'CORR', description: 'Correctivo' },
      { code: 'PEND', description: 'Pendiente' },
    ];

    for (const statusServiceItem of statusServiceItems) {
      const existingStatus = await manager.findOne(ServiceItemsStatuses, {
        where: { code: statusServiceItem.code },
      });

      if (!existingStatus) {
        const serviceItemsStatus = new ServiceItemsStatuses();
        serviceItemsStatus.code = statusServiceItem.code;
        serviceItemsStatus.description = statusServiceItem.description;
        await manager.save(serviceItemsStatus);
      }
    }
  }

  private async serviceItems(manager: EntityManager): Promise<void> {
    const serviceItems = [
      {
        name: 'Neumáticos',
        description: 'Neumáticos para todo tipo de vehículos',
        serviceCode: 'TIRES',
        image: this.baseUrl + 'tires.svg',
        order: 1,
        code: 'TIRES',
      },
      {
        name: 'Baterías',
        description: 'Baterías de alto rendimiento para todo tipo de vehículos',
        serviceCode: 'BATTERY',
        image: this.baseUrl + 'batteries.svg',
        order: 2,
        code: 'BATTERY',
      },
      {
        name: 'Tren Delantero',
        description: 'Revisión y mantenimiento del tren delantero',
        serviceCode: 'FRONT_AXLE',
        image: this.baseUrl + 'front_axle.svg',
        order: 3,
        code: 'FRONT_AXLE',
      },
      {
        name: 'Cambio de Aceite',
        description: 'Cambio de aceite con productos de alta calidad',
        serviceCode: 'OIL_CHANGE',
        image: this.baseUrl + 'oil_change.svg',
        order: 4,
        code: 'OIL_CHANGE',
      },
      {
        name: 'Amortiguadores',
        description: 'Reemplazo y revisión de amortiguadores',
        serviceCode: 'SHOCK_ABSORBERS',
        image: this.baseUrl + 'shock_absorbers.svg',
        order: 5,
        code: 'SHOCK_ABSORBERS',
      },
      {
        name: 'Afinamiento',
        description: 'Afinamiento del motor para mejorar el rendimiento',
        serviceCode: 'TUNING',
        image: this.baseUrl + 'tuning.svg',
        order: 6,
        code: 'TUNING',
      },
      {
        name: 'Alineación',
        description: 'Ajuste de dirección y alineación de ruedas',
        serviceCode: 'ALIGNMENT',
        image: this.baseUrl + 'alignment.svg',
        order: 7,
        code: 'ALIGNMENT',
      },
      {
        name: 'Balanceo',
        description: 'Balanceo de ruedas para una conducción estable',
        serviceCode: 'BALANCING',
        image: this.baseUrl + 'balancing.svg',
        order: 8,
        code: 'BALANCING',
      },
      {
        name: 'Frenos',
        description: 'Sistemas de frenos y repuestos para mayor seguridad',
        serviceCode: 'BRAKES',
        image: this.baseUrl + 'brakes.svg',
        order: 9,
        code: 'BRAKES',
      },
      {
        name: 'Geometría',
        description: 'Ajuste y calibración de la geometría del vehículo',
        serviceCode: 'GEOMETRY',
        image: this.baseUrl + 'geometry.svg',
        order: 10,
        code: 'GEOMETRY',
      },
      {
        name: 'Mantención de Kilometraje',
        description: 'Servicio de mantención según kilometraje del vehículo',
        serviceCode: 'KM_MAINTENANCE',
        image: this.baseUrl + 'km_maintenance.svg',
        order: 11,
        code: 'KM_MAINTENANCE',
      },
      {
        name: 'Higienización',
        description: 'Limpieza profunda y desinfección del vehículo',
        serviceCode: 'HYGIENIZATION',
        image: this.baseUrl + 'hygienization.svg',
        order: 12,
        code: 'HYGIENIZATION',
      },
      {
        name: 'Fluidos',
        description: 'Revisión y cambio de líquidos esenciales del vehículo',
        serviceCode: 'FLUIDS',
        image: this.baseUrl + 'fluids.svg',
        order: 13,
        code: 'FLUIDS',
      },
      {
        name: 'Eléctrico',
        description: 'Revisión y reparación del sistema eléctrico del vehículo',
        serviceCode: 'ELECTRICAL',
        image: this.baseUrl + 'electrical.svg',
        order: 14,
        code: 'ELECTRICAL',
      },
      {
        name: 'Accesorios',
        description: 'Accesorios para mejorar la funcionalidad y estética del vehículo',
        serviceCode: 'ACCESSORIES',
        image: this.baseUrl + 'accessories.svg',
        order: 15,
        code: 'ACCESSORIES',
      },
      {
        name: 'Filtros',
        description: 'Filtros de aire, aceite y combustible para un mejor rendimiento',
        serviceCode: 'FILTERS',
        image: this.baseUrl + 'filters.svg',
        order: 16,
        code: 'FILTERS',
      },
    ];

    const service = await manager.findOne(Service, { where: { code: 'RTP' } });
    if (!service) {
      throw new Error("Service with code 'RTP' not found. Please check the database.");
    }

    for (const serviceItem of serviceItems) {
      const existingServiceItem = await manager.findOne(ServiceItems, {
        where: { code: serviceItem.code },
      });

      if (!existingServiceItem) {
        const newServiceItem = new ServiceItems();
        newServiceItem.name = serviceItem.name;
        newServiceItem.description = serviceItem.description;
        newServiceItem.image = serviceItem.image;
        newServiceItem.service = service;
        newServiceItem.order = serviceItem.order;
        newServiceItem.code = serviceItem.code;

        await manager.save(newServiceItem);
      }
    }
  }
}
