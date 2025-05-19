import { ConflictException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Customer } from 'src/infrastructure/database/entities/customer.entity';
import { Vehicle } from 'src/infrastructure/database/entities/vehicle.entity';
import { BudgetGroupRepository } from 'src/infrastructure/database/repositories/budget-group.repository';
import { CustomerCompanyRepository } from 'src/infrastructure/database/repositories/customer-company.repository';
import { CustomerOptionRepository } from 'src/infrastructure/database/repositories/customer-option.repository';
import { CustomerRepository } from 'src/infrastructure/database/repositories/customer.repository';
import { LeadRepository } from 'src/infrastructure/database/repositories/lead.repository';
import { VehiclesRepository } from 'src/infrastructure/database/repositories/vehicle.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import { CustomersDomain } from 'src/shared/domain/customers.domain';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { CustomerPeopleRepository } from '../../infrastructure/database/repositories/customer-people.repository';
import { VehiclesService } from '../core/vehicles/vehicles.service';
import {
  CreateCustomerDto,
  CreateLeadDto,
  ResponseCustomerDto,
  ResponseLeadDto,
  ResponseSearchCustomerDto,
} from './customers.dto';

@Injectable()
export class CustomersService {
  constructor(
    private readonly logger: Logger,
    private readonly customerPeopleRepository: CustomerPeopleRepository,
    private readonly leadRepository: LeadRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly budgetGroupRepository: BudgetGroupRepository,
    private readonly vehicleRepository: VehiclesRepository,
    private readonly vehicleService: VehiclesService,
    private readonly customerOptionsRepository: CustomerOptionRepository,
    private readonly customerCompanyRepository: CustomerCompanyRepository,
  ) {}

  private sanitizeField<T>(value: T): T | null {
    return value ?? null;
  }

  private async updateCustomerPeople(customerPeople: any, body: CreateCustomerDto, email: string): Promise<any> {
    this.logger.log('updateCustomerPeople', body);
    customerPeople.name = this.sanitizeField(body.name) ?? customerPeople.name;
    customerPeople.email = this.sanitizeField(email) ?? customerPeople.email;
    customerPeople.lastname = this.sanitizeField(body.lastname) ?? customerPeople.lastname;
    customerPeople.secondLastname = this.sanitizeField(body.secondLastname) ?? customerPeople.secondLastname;
    customerPeople.phoneZone = this.sanitizeField(Number(body.phoneZone)) ?? customerPeople.phoneZone;
    customerPeople.phoneNumber = this.sanitizeField(Number(body.phone)) ?? customerPeople.phoneNumber;
    customerPeople.consultationChannel =
      this.sanitizeField(body.consultationChannel) ?? customerPeople.consultationChannel;
    customerPeople.documentType = CustomersDomain.DocumentType.RUT;
    customerPeople.documentId = this.cleanDocument(this.sanitizeField(body.document)) ?? customerPeople.documentId;
    customerPeople.address = this.sanitizeField(body.address) ?? customerPeople.address;
    customerPeople.addressLatitude = this.sanitizeField(Number(body.addressLatitude)) ?? customerPeople.addressLatitude;
    customerPeople.addressLongitude =
      this.sanitizeField(Number(body.addressLongitude)) ?? customerPeople.addressLongitude;

    return this.customerPeopleRepository.save(customerPeople);
  }

  private async updateLead(lead: any, body: CreateLeadDto): Promise<any> {
    this.logger.log('updateLead', body);
    lead.name = this.sanitizeField(body.name) ?? lead.name;
    lead.lastname = this.sanitizeField(body.lastname) ?? lead.lastname;
    lead.secondLastname = this.sanitizeField(body.secondLastname) ?? lead.secondLastname;
    lead.phoneZone = this.sanitizeField(Number(body.phoneZone)) ?? lead.phoneZone;
    lead.phoneNumber = this.sanitizeField(Number(body.phone)) ?? lead.phoneNumber;

    return this.leadRepository.save(lead);
  }

  private async createNewLead(email: string, body: CreateLeadDto): Promise<any> {
    this.logger.log('body', body);
    const newLead = await this.leadRepository.create({
      email,
      name: this.sanitizeField(body.name),
      lastname: this.sanitizeField(body.lastname),
      secondLastname: this.sanitizeField(body.secondLastname),
      phoneZone: this.sanitizeField(Number(body.phoneZone)),
      phoneNumber: this.sanitizeField(Number(body.phone)),
    });

    return this.leadRepository.save(newLead);
  }

  private async handleExistingCustomer(body: CreateLeadDto, email: string): Promise<ResponseCustomerDto> {
    const customerPeopleDocument = await this.customerPeopleRepository.findByDocument(body.document);
    const customerPeopleEmail = await this.customerPeopleRepository.findByEmail(email);
    this.logger.log('handleExistingCustomer', customerPeopleDocument);

    if (
      customerPeopleDocument &&
      customerPeopleEmail &&
      customerPeopleDocument?.documentId !== customerPeopleEmail?.documentId
    ) {
      throw new ConflictException(
        `El RUT ingresado corresponde al cliente: ${customerPeopleDocument.name} ${customerPeopleDocument.lastname} ${customerPeopleDocument.secondLastname}, correo: ${customerPeopleDocument.email}. No podrá ser asociado a este cliente.`,
      );
    }

    if (customerPeopleDocument) {
      const updatedCustomerPeople = await this.updateCustomerPeople(customerPeopleDocument, body, email);
      return new ResponseCustomerDto(updatedCustomerPeople.customer.id, updatedCustomerPeople);
    }
    return null;
  }

  private async handleExistingLead(email: string, body: CreateLeadDto): Promise<ResponseLeadDto> {
    const lead = await this.leadRepository.findByEmail(email);

    if (lead) {
      const updatedLead = await this.updateLead(lead, body);
      return plainToInstance(ResponseLeadDto, updatedLead);
    }

    return null;
  }

  async createLead(email: string, body: CreateLeadDto): Promise<ResponseLeadDto> {
    this.logger.log('createLead', email);
    try {
      if (body.document) {
        const customerCompany = await this.customerCompanyRepository.findOne(body.document);
        if (customerCompany) {
          throw new ConflictException(
            `El RUT ingresado corresponde al cliente: ${customerCompany.legalName}, correo: ${customerCompany.contactEmail}. No podrá ser asociado a este cliente.`,
          );
        }

        const customerResult = await this.handleExistingCustomer(body, email);
        if (customerResult) {
          await this.deleteLeadAndUpdateBudgetGroup(email, customerResult.id);
          await this.createOrUpdateCustomerOptions(customerResult.id, body);
          return plainToInstance(ResponseLeadDto, customerResult);
        }

        const newCustomer = await this.createCustomerPeople(email, body);
        await this.deleteLeadAndUpdateBudgetGroup(email, newCustomer.id);
        await this.createOrUpdateCustomerOptions(newCustomer.id, body);
        return plainToInstance(ResponseLeadDto, newCustomer);
      } else {
        const leadResult = await this.handleExistingLead(email, body);
        if (leadResult) return leadResult;

        const newLead = await this.createNewLead(email, body);
        return plainToInstance(ResponseLeadDto, newLead);
      }
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      } else {
        this.logger.error('Error al crear o actualizar Lead/CustomerPeople', error.stack);
        throw new InternalServerErrorException('Hubo un error al crear o actualizar el Lead/CustomerPeople');
      }
    }
  }

  async createOrUpdateCustomerOptions(customerId: string, data: any) {
    if (data.sendPromotions === undefined || data.sendNewsletters === undefined) {
      return null;
    }

    const customer = await this.customerRepository.findById(customerId);
    const customerOptions = await this.customerOptionsRepository.findByCustomerId(customer.id);
    if (customerOptions) {
      customerOptions.sendPromotions = data.sendPromotions;
      customerOptions.sendNewsletters = data.sendNewsletters;
      return await this.customerOptionsRepository.save(customerOptions);
    } else {
      const newCustomerOptions = await this.customerOptionsRepository.create({
        customer,
        sendPromotions: data.sendPromotions,
        sendNewsletters: data.sendNewsletters,
      });
      return await this.customerOptionsRepository.save(newCustomerOptions);
    }
  }

  async deleteLeadAndUpdateBudgetGroup(email: string, customerId: string): Promise<void> {
    try {
      this.logger.log('deleteLeadAndUpdateBudgetGroup', email, customerId);
      await this.updateBudgetGroupWithCustomer(email, customerId);
      await this.deleteLead(email);
    } catch (error) {
      this.logger.error('Error al eliminar Lead y actualizar budget group', error.stack);
      throw new InternalServerErrorException('Hubo un error al eliminar el Lead y actualizar el budget group');
    }
  }

  async deleteLead(email: string): Promise<void> {
    try {
      const lead = await this.leadRepository.findByEmail(email);
      if (lead) {
        await this.leadRepository.deleteByEmail(email);
      }
    } catch (error) {
      this.logger.error('Error al eliminar Lead', error.stack);
      throw new InternalServerErrorException('Hubo un error al eliminar el Lead');
    }
  }

  async updateBudgetGroupWithCustomer(email: string, customerId: string): Promise<void> {
    try {
      const lead = await this.leadRepository.findByEmail(email);
      if (lead?.budgetGroups?.length) {
        for (const budgetGroup of lead.budgetGroups) {
          budgetGroup.customer = await this.customerRepository.findById(customerId);
          budgetGroup.lead = null;
          await this.budgetGroupRepository.save(budgetGroup);
        }

        lead.budgetGroups = [];
        await this.leadRepository.save(lead);
      }
    } catch (error) {
      this.logger.error('Error al actualizar el budget group', error.stack);
      throw new InternalServerErrorException('Hubo un error al actualizar el budget group');
    }
  }

  async getCustomerByEmail(email: string): Promise<ResponseLeadDto> {
    try {
      const customerPeople = await this.customerPeopleRepository.findByEmail(email);
      if (customerPeople) return plainToInstance(ResponseLeadDto, customerPeople);

      const lead = await this.leadRepository.findByEmail(email);
      if (lead) return plainToInstance(ResponseLeadDto, lead);

      return null;
    } catch (error) {
      this.logger.error('Error al obtener Lead/CustomerPeople', error.stack);
      throw new InternalServerErrorException('Hubo un error al obtener el Lead/CustomerPeople');
    }
  }

  async createCustomerPeople(email: string, body: CreateLeadDto): Promise<ResponseCustomerDto> {
    try {
      const customerPeople = await this.customerPeopleRepository.findByEmail(email);
      if (customerPeople) {
        const updatedCustomerPeople = await this.updateCustomerPeople(customerPeople, body, email);
        return new ResponseCustomerDto(updatedCustomerPeople.customer.id, updatedCustomerPeople);
      }

      const newCustomerPeople = await this.createNewCustomerPeople(email, body);
      const newCustomer = await this.createCustomer(email, newCustomerPeople);
      return new ResponseCustomerDto(newCustomer.id, newCustomerPeople);
    } catch (error) {
      this.logger.error('Error al crear o actualizar CustomerPeople', error.stack);
      throw new InternalServerErrorException('Hubo un error al crear o actualizar el CustomerPeople');
    }
  }

  private async createNewCustomerPeople(email: string, body: CreateCustomerDto): Promise<any> {
    this.logger.log('createNewCustomer', body);
    const newCustomer = await this.customerPeopleRepository.create({
      email,
      name: this.sanitizeField(body.name),
      lastname: this.sanitizeField(body.lastname),
      secondLastname: this.sanitizeField(body.secondLastname),
      phoneZone: this.sanitizeField(Number(body.phoneZone)),
      phoneNumber: this.sanitizeField(Number(body.phone)),
      documentId: this.cleanDocument(this.sanitizeField(body.document)),
      documentType: CustomersDomain.DocumentType.RUT,
      address: this.sanitizeField(body.address),
      addressLatitude: this.sanitizeField(Number(body.addressLatitude)),
      addressLongitude: this.sanitizeField(Number(body.addressLongitude)),
      consultationChannel: null,
    });

    return this.customerPeopleRepository.save(newCustomer);
  }

  private async createCustomer(email: string, customerPeople): Promise<any> {
    this.logger.log('createCustomer');
    const customer = await this.customerRepository.create({
      customerType: CustomersDomain.CustomerType.PERSON,
      customerPeople: customerPeople,
    });
    return this.customerRepository.save(customer);
  }

  private cleanDocument(document: string): string {
    if (!document) return null;
    return document.replace(/\./g, '');
  }

  async getCustomerByIdAndType(type: string, id: string): Promise<any> {
    try {
      if (type === AppDomain.CUSTOMER_TYPES.LEAD) {
        const lead = await this.leadRepository.findById(id);
        return plainToInstance(ResponseLeadDto, lead);
      }

      if (type === AppDomain.CUSTOMER_TYPES.CUSTOMER) {
        const customer = await this.customerRepository.findById(id);
        return plainToInstance(ResponseSearchCustomerDto, customer);
      }

      return null;
    } catch (error) {
      this.logger.error('Error al obtener Lead/Customere', error.stack);
      throw new InternalServerErrorException('Hubo un error al obtener el Lead/Customer');
    }
  }

  async getCustomerVehicles(id: string): Promise<any> {
    this.logger.log('getCustomerVehicles', id);
    try {
      const customer = await this.customerRepository.findById(id);
      if (!customer) {
        return [];
      }

      const vehiclesCustomer = customer.vehiclesCustomer;
      if (!vehiclesCustomer?.length) {
        return [];
      }

      const vehicles = await this.getVehiclesByIds(vehiclesCustomer);
      const vehiclesWithWorkorders = this.filterVehiclesWithInProgressWorkorders(vehicles);

      if (!vehiclesWithWorkorders.length) {
        return [];
      }

      const formattedVehicles = this.formatVehiclesResponse(vehiclesWithWorkorders);
      return this.sortVehiclesByLastWorkOrder(formattedVehicles);
    } catch (error) {
      this.logger.error('Error al obtener los vehículos del cliente', error.stack);
      throw new InternalServerErrorException('Hubo un error al obtener los vehículos del cliente');
    }
  }

  private sortVehiclesByLastWorkOrder(vehicles: any[]) {
    return vehicles.sort((a, b) => {
      const lastWorkOrderA = a.lastWorkOrder?.createdAt?.getTime();
      const lastWorkOrderB = b.lastWorkOrder?.createdAt?.getTime();

      if (lastWorkOrderA && lastWorkOrderB) {
        return lastWorkOrderB - lastWorkOrderA;
      }
      return 0;
    });
  }

  private async getVehiclesByIds(vehiclesCustomer: any[]) {
    return await this.vehicleRepository.findByIds(vehiclesCustomer.map((vc) => vc.vehicle.id));
  }

  filterVehiclesWithInProgressWorkorders(vehicles: any[]) {
    this.logger.log('filterVehiclesWithInProgressWorkorders', vehicles.length);
    return vehicles.filter((vehicle) =>
      vehicle.workorders?.some((workOrder) => workOrder.status.code === SalesDomain.WORKORDERS_STATUS.IN_PROGRESS),
    );
  }

  filterCustomersWithInProgressWorkorders(customers: Customer[]) {
    this.logger.log('filterCustomersWithInProgressWorkorders', customers.length);
    return customers.filter((customer) =>
      customer.workorders?.some((workOrder) => workOrder.status.code === SalesDomain.WORKORDERS_STATUS.IN_PROGRESS),
    );
  }

  filterCompaniesWithInProgressWorkorders(companies: any[]) {
    this.logger.log('filterCompaniesWithInProgressWorkorders', companies.length);
    return companies.filter((company) =>
      company.workorders?.some((workOrder) => workOrder.status.code === SalesDomain.WORKORDERS_STATUS.IN_PROGRESS),
    );
  }

  private getLastWorkOrder(vehicle: Vehicle) {
    if (!vehicle.workorders?.length) return null;

    const sortedWorkOrders = [...vehicle.workorders].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return sortedWorkOrders[0];
  }

  private formatVehiclesResponse(vehicles: any[]) {
    return vehicles.map((vehicle) => {
      return {
        ...this.vehicleService.formatVehicleResponse(vehicle),
        lastWorkOrder: this.getLastWorkOrder(vehicle),
      };
    });
  }

  public async validateUniqueRut(rut: string) {
    return await this.customerPeopleRepository.findByDocument(rut);
  }
}
