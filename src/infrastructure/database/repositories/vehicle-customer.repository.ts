import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { VehiclesCustomer } from '../entities/vehicle-customer.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { AbstractRepository } from './abstract.repository';
import { CustomerRepository } from './customer.repository';
import { VehiclesRepository } from './vehicle.repository';

@Injectable()
export class VehicleCustomerRepository extends AbstractRepository<VehiclesCustomer> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,

    private readonly vehicleRepository: VehiclesRepository,
    private readonly customerRepository: CustomerRepository,
  ) {
    super(dataSource.getRepository(VehiclesCustomer));
  }

  async save(vehicleId: string, customerId: string): Promise<VehiclesCustomer> {
    const vehicle = await this.vehicleRepository.findById(vehicleId);
    const customer = await this.customerRepository.findById(customerId);

    if (!vehicle || !customer) {
      throw new Error('Not found');
    }

    this.assignVehicleOwner(vehicle, customer);

    await this.vehicleRepository.save(vehicle);

    const existingVehicleCustomer = await this.getVehicleCustomer(vehicleId, customerId);
    if (existingVehicleCustomer) {
      return existingVehicleCustomer;
    }
    const vehicleCustomer = this.repository.create({
      vehicle,
      customer,
    });

    return this.repository.save(vehicleCustomer);
  }

  async getVehicleCustomer(vehicleId: string, customerId: string): Promise<VehiclesCustomer> {
    return this.repository.findOne({
      where: {
        vehicle: { id: vehicleId },
        customer: { id: customerId },
      },
    });
  }

  private assignVehicleOwner(vehicle: Vehicle, customer: Customer): void {
    const { name, lastname } = customer.customerPeople || {};
    const { legalName } = customer.customerCompany || {};

    if (legalName) {
      vehicle.owner = legalName;
    } else {
      vehicle.owner = `${name ?? ''} ${lastname ?? ''}`;
    }
  }
}
