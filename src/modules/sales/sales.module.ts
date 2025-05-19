import { Logger, Module } from '@nestjs/common';
import { DataModule } from 'src/infrastructure/database/data.module';
import { SystemParameterRepository } from 'src/infrastructure/database/repositories/system-parameter.repository';
import { VehicleCustomerRepository } from 'src/infrastructure/database/repositories/vehicle-customer.repository';
import { WorkorderItemRecordRepository } from 'src/infrastructure/database/repositories/workorder-item-record.repository';
import { UsersService } from '../admin/users/users.service';
import { AuditLogService } from '../security/audit-log/audit-log.service';
import { AppointmentsController } from './appointments/appointments.controller';
import { AppointmentsService } from './appointments/appointments.service';
import { BudgetsController } from './budgets/budgets.controller';
import { BudgetsService } from './budgets/budgets.service';
import { ConversationsController } from './conversations/conversations.controller';
import { NotesController } from './notes/notes.controller';
import { NotesService } from './notes/notes.service';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { ReassignedWorkordersController } from './workorders/reassigned-workorders.controller';
import { WorkordersController } from './workorders/workorders.controller';
import { WorkordersService } from './workorders/workorders.service';
import { BussinessLineRepository } from 'src/infrastructure/database/repositories/bussiness-line.repository';
import { BudgetServicesItemsRepository } from 'src/infrastructure/database/repositories/budget-services-items.repository';
import { ServiceItemsRepository } from 'src/infrastructure/database/repositories/service-items.repository';
import { ServiceItemsStatusesRepository } from 'src/infrastructure/database/repositories/service-items-statuses.repository';
import { WorkorderServicesItemsRepository } from 'src/infrastructure/database/repositories/workorder-services-items.repository';
import { BudgetItemRepository } from 'src/infrastructure/database/repositories/budget-item.repository';
import { SearchCriteriaRepository } from 'src/infrastructure/database/repositories/search-criteria.repository';
import { SearchHistoryRepository } from 'src/infrastructure/database/repositories/search-history.repository';
import { MinioService } from 'src/infrastructure/minio/minio.service';
@Module({
  imports: [DataModule],
  controllers: [
    ConversationsController,
    BudgetsController,
    AppointmentsController,
    WorkordersController,
    ReassignedWorkordersController,
    SalesController,
    NotesController,
  ],
  providers: [
    Logger,
    UsersService,
    AuditLogService,
    BudgetsService,
    AppointmentsService,
    WorkordersService,
    SalesService,
    SystemParameterRepository,
    NotesService,
    VehicleCustomerRepository,
    WorkorderItemRecordRepository,
    BussinessLineRepository,
    BudgetServicesItemsRepository,
    ServiceItemsRepository,
    ServiceItemsStatusesRepository,
    WorkorderServicesItemsRepository,
    BudgetItemRepository,
    SearchCriteriaRepository,
    SearchHistoryRepository,
    MinioService,
  ],
  exports: [],
})
export class SalesModule {}
