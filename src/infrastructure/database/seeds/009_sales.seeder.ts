import { SalesDomain } from 'src/shared/domain/sales.domain';
import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { WorkorderStatus } from '../entities/workorder-status.entity';
import { BudgetStatus } from '../entities/budget-status.entity';
import { AppointmentStatus } from '../entities/appointment-status.entity';
import { SearchCriteria } from '../entities/search-criteria';
import { WorkorderItemStatus } from '../entities/workorder-item-statuses.entity';

export class SaleSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const apppointmentStatusRepository = dataSource.getRepository(AppointmentStatus);
    const workorderStatusRepository = dataSource.getRepository(WorkorderStatus);
    const budgetStatusRepository = dataSource.getRepository(BudgetStatus);
    const searchCriteriaRepository = dataSource.getRepository(SearchCriteria);
    const workorderItemStatusRepository = dataSource.getRepository(WorkorderItemStatus);
    // Load appointment statuses
    const appointmentStatuses = await this.loadAppointmentStatuses();
    await apppointmentStatusRepository.upsert(appointmentStatuses, ['code']);

    // Load budget statuses
    const budgetStatuses = await this.loadBudgetStatuses();
    await budgetStatusRepository.upsert(budgetStatuses, ['code']);

    // Load workorder statuses
    const workorderStatuses = await this.loadWorkorderStatuses();
    await workorderStatusRepository.upsert(workorderStatuses, ['code']);

    // Load workorder item statuses
    const workorderItemStatuses = await this.loadWorkorderItemStatuses();
    await workorderItemStatusRepository.upsert(workorderItemStatuses, ['code']);

    // Load search criteria
    const searchCriteria = await this.loadSearchCriteria(searchCriteriaRepository);
    await searchCriteriaRepository.save(searchCriteria);
  }

  private async loadAppointmentStatuses() {
    const statuses = [
      { code: SalesDomain.APPOINTMENT_STATUS.SCHEDULED, description: 'Programado' },
      { code: SalesDomain.APPOINTMENT_STATUS.CONFIRMED_LEON, description: 'Confirmado por León' },
      { code: SalesDomain.APPOINTMENT_STATUS.CONFIRMED_CLIENT, description: 'Confirmado por cliente' },
      { code: SalesDomain.APPOINTMENT_STATUS.CANCELLED, description: 'Cancelado' },
      { code: SalesDomain.APPOINTMENT_STATUS.RESCHEDULED, description: 'Reprogramado' },
      { code: SalesDomain.APPOINTMENT_STATUS.EXPIRED, description: 'Expirado' },
      { code: SalesDomain.APPOINTMENT_STATUS.COMPLETED, description: 'Completado' },
    ];

    const appointmentStatuses = [];
    for (const status of statuses) {
      const appointmentStatus = new AppointmentStatus();
      appointmentStatus.code = status.code;
      appointmentStatus.description = status.description;
      appointmentStatuses.push(appointmentStatus);
    }
    return appointmentStatuses;
  }

  private async loadBudgetStatuses() {
    const statuses = [
      { code: SalesDomain.BUDGET_STATUS.CREATING, description: 'Creando' },
      { code: SalesDomain.BUDGET_STATUS.SENT, description: 'Enviado' },
      { code: SalesDomain.BUDGET_STATUS.CANCELLED, description: 'Cancelado' },
      { code: SalesDomain.BUDGET_STATUS.EXPIRED, description: 'Expirado' },
      { code: SalesDomain.BUDGET_STATUS.APPROVED, description: 'Aprobado' },
    ];

    const budgetStatuses = [];
    for (const status of statuses) {
      const budgetStatus = new BudgetStatus();
      budgetStatus.code = status.code;
      budgetStatus.description = status.description;
      budgetStatuses.push(budgetStatus);
    }
    return budgetStatuses;
  }

  private async loadWorkorderStatuses() {
    const statuses = [
      { code: SalesDomain.WORKORDERS_STATUS.IN_PROGRESS, description: 'En patio' },
      { code: SalesDomain.WORKORDERS_STATUS.COMPLETED, description: 'Completada' },
      { code: SalesDomain.WORKORDERS_STATUS.AWAITING_PAYMENT, description: 'Enviada a caja' },
      { code: SalesDomain.WORKORDERS_STATUS.ABORTED, description: 'Abortada' },
      { code: SalesDomain.WORKORDERS_STATUS.HISTORICAL, description: 'OT Histórica' },
    ];

    const workorderStatuses = [];
    for (const status of statuses) {
      const workorderStatus = new WorkorderStatus();
      workorderStatus.code = status.code;
      workorderStatus.description = status.description;
      workorderStatuses.push(workorderStatus);
    }
    return workorderStatuses;
  }

  private async loadWorkorderItemStatuses() {
    const statuses = [
      { code: SalesDomain.WORKORDERS_ITEMS_STATUS.PENDING, description: 'Pendiente' },
      { code: SalesDomain.WORKORDERS_ITEMS_STATUS.ASSIGNED, description: 'Asignado' },
      { code: SalesDomain.WORKORDERS_ITEMS_STATUS.COMPLETED, description: 'Completado' },
      {
        code: SalesDomain.WORKORDERS_ITEMS_STATUS.IN_PROGRESS,
        description: 'En proceso',
      },
      {
        code: SalesDomain.WORKORDERS_ITEMS_STATUS.PAUSED,
        description: 'En pausa',
      },
    ];

    const workorderItemStatuses = [];
    for (const status of statuses) {
      const workorderItemStatus = new WorkorderItemStatus();
      workorderItemStatus.code = status.code;
      workorderItemStatus.description = status.description;
      workorderItemStatuses.push(workorderItemStatus);
    }
    return workorderItemStatuses;
  }

  private async loadSearchCriteria(searchCriteriaRepository: Repository<SearchCriteria>) {
    const criteriaData = [
      { code: SalesDomain.SEARCH_CRITERIA.SEARCH_BY_MEASURE, name: 'Medida' },
      { code: SalesDomain.SEARCH_CRITERIA.SEARCH_BY_VEHICLE, name: 'Vehículo' },
    ];

    const searchCriteria: SearchCriteria[] = [];

    for (const data of criteriaData) {
      const existingCriteria = await searchCriteriaRepository.findOne({
        where: { code: data.code },
      });

      if (!existingCriteria) {
        const criteria = new SearchCriteria();
        criteria.code = data.code;
        criteria.name = data.name;
        searchCriteria.push(criteria);
      }
    }

    return searchCriteria;
  }
}
