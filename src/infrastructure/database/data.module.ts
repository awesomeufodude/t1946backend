import { Logger, Module } from '@nestjs/common';
import { UsersService } from 'src/modules/admin/users/users.service';
import { AuditLogService } from 'src/modules/security/audit-log/audit-log.service';
import { databaseProviders } from './config/database.provider';
import { AppointmentStatusRepository } from './repositories/appointment-status.repository';
import { AppointmentTimeslotRepository } from './repositories/appointment-timeslot.repository';
import { AppointmentRepository } from './repositories/appointment.repository';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { BudgetGroupRepository } from './repositories/budget-group.repository';
import { BudgetStatusRepository } from './repositories/budget-status.repository';
import { BudgetRepository } from './repositories/budget.repository';
import { CatalogVehicleBrandRepository } from './repositories/catalog-vehicle-brand.repository';
import { CatalogVehicleModelRepository } from './repositories/catalog-vehicle-model.repository';
import { CatalogVehicleVersionRepository } from './repositories/catalog-vehicle-version.repository';
import { CatalogVehicleRepository } from './repositories/catalog-vehicle.repository';
import { ChannelRepository } from './repositories/channel.repository';
import { CompanyBusinessRepository } from './repositories/company-business.repository';
import { ConsultationChannelRepository } from './repositories/consultation-channel.repository';
import { CustomerCategoryRepository } from './repositories/customer-category.repository';
import { CustomerCompanyRepository } from './repositories/customer-company.repository';
import { CustomerOptionRepository } from './repositories/customer-option.repository';
import { CustomerPeopleRepository } from './repositories/customer-people.repository';
import { CustomerRepository } from './repositories/customer.repository';
import { LaborTimeRepository } from './repositories/labor-time.repository';
import { LeadRepository } from './repositories/lead.repository';
import { NoteRepository } from './repositories/note.repository';
import { PassCodeCredentialRepository } from './repositories/passcode-credential.repository';
import { ProductStockRepository } from './repositories/product-stock.repository';
import { ProductTireRepository } from './repositories/product-tire.repository';
import { ProductRepository } from './repositories/product.repository';
import { RoleRepository } from './repositories/role.repository';
import { ServiceRepository } from './repositories/service.repository';
import { UserRepository } from './repositories/user.repository';
import { VehicleCustomerRepository } from './repositories/vehicle-customer.repository';
import { VehiclesRepository } from './repositories/vehicle.repository';
import { WorkorderItemRecordRepository } from './repositories/workorder-item-record.repository';
import { WorkorderRepository } from './repositories/workorder.repository';
import { NoteFileRepository } from './repositories/note.file.repository';
import { BudgetServicesItemsRepository } from './repositories/budget-services-items.repository';
import { WorkorderServicesItemsRepository } from './repositories/workorder-services-items.repository';

const moduleProviders = [
  ...databaseProviders,
  // Repositories
  AppointmentRepository,
  AppointmentStatusRepository,
  AppointmentTimeslotRepository,
  AuditLogRepository,
  BudgetRepository,
  BudgetGroupRepository,
  BudgetStatusRepository,
  CatalogVehicleRepository,
  CatalogVehicleBrandRepository,
  CatalogVehicleModelRepository,
  CatalogVehicleVersionRepository,
  ChannelRepository,
  CompanyBusinessRepository,
  ConsultationChannelRepository,
  CustomerRepository,
  CustomerOptionRepository,
  CustomerCategoryRepository,
  CustomerPeopleRepository,
  CustomerCompanyRepository,
  LeadRepository,
  PassCodeCredentialRepository,
  ProductRepository,
  ProductTireRepository,
  ProductStockRepository,
  RoleRepository,
  ServiceRepository,
  UserRepository,
  VehiclesRepository,
  WorkorderRepository,
  LaborTimeRepository,
  NoteRepository,
  VehicleCustomerRepository,
  WorkorderItemRecordRepository,
  NoteFileRepository,
  BudgetServicesItemsRepository,
  NoteFileRepository,
  WorkorderServicesItemsRepository,
];

@Module({
  imports: [],
  providers: [...moduleProviders, Logger, UsersService, AuditLogService],
  exports: [...moduleProviders],
})
export class DataModule {}
