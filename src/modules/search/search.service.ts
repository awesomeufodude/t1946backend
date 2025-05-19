import { Injectable, Logger } from '@nestjs/common';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { CustomersService } from '../customers/customers.service';
import { ResponseSearchDto } from './search.dto';

@Injectable()
export class SearchService {
  constructor(
    private readonly logger: Logger,
    private readonly vehicleRepository: VehiclesRepository,
    private readonly leadRepository: LeadRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly customerService: CustomersService,
  ) {}
  async searchCustomersAndVehicles(search: string) {
    this.logger.log('searchCustomersAndVehicles', search);

    const vehicles = await this.vehicleRepository.search(search);
    const leads = [];
    const customers = await this.customerRepository.searchCustomer(search);
    const companies = await this.customerRepository.searchCompanies(search);
    const customerWithWorkOrders = this.customerService.filterCustomersWithInProgressWorkorders(customers);
    const vehiclesWithWorkOrders = this.customerService.filterVehiclesWithInProgressWorkorders(vehicles);
    const companiesWithWorkOrders = this.customerService.filterCompaniesWithInProgressWorkorders(companies);

    return new ResponseSearchDto(customerWithWorkOrders, vehiclesWithWorkOrders, leads, companiesWithWorkOrders);
  }
}
