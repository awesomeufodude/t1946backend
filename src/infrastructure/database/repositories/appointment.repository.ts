import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { SalesDomain } from 'src/shared/domain/sales.domain';
import { DataSource } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { AbstractRepository } from './abstract.repository';
import { AppointmentStatusRepository } from './appointment-status.repository';
import { BudgetRepository } from './budget.repository';

@Injectable()
export class AppointmentRepository extends AbstractRepository<Appointment> {
  private readonly RELATIONS = [
    'budget',
    'budget.status',
    'budget.budgetGroup',
    'budget.budgetGroup.customer',
    'budget.budgetGroup.lead',
    'budget.budgetGroup.vehicle',
    'budget.budgetGroup.vehicle.vehicleCatalog',
    'budget.workorder',
  ];

  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private appointmentStatusRepository: AppointmentStatusRepository,
    private budgetRepository: BudgetRepository,
  ) {
    super(dataSource.getRepository(Appointment));
  }

  async findById(id: string) {
    const appointment = await this.repository.findOne({
      where: { id },
      relations: this.RELATIONS,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async findByUserStoreAndDate(userId: string, storeId: string, date: Date) {
    const appointments = await this.repository.find({
      where: {
        budget: {
          budgetGroup: {
            store: { id: storeId },
            createdBy: { id: userId },
          },
        },
      },
      relations: this.RELATIONS,
    });

    const filteredAppointments = appointments.filter((appointment) => {
      if (appointment.status.code == SalesDomain.APPOINTMENT_STATUS.EXPIRED) {
        return true;
      }

      const isTodayOrFuture = appointment.appointmentDate >= date;

      if (
        [
          SalesDomain.APPOINTMENT_STATUS.SCHEDULED,
          SalesDomain.APPOINTMENT_STATUS.CONFIRMED_LEON,
          SalesDomain.APPOINTMENT_STATUS.CONFIRMED_CLIENT,
          SalesDomain.APPOINTMENT_STATUS.RESCHEDULED,
        ].includes(appointment.status.code)
      ) {
        return isTodayOrFuture;
      }

      if (appointment.status.code === SalesDomain.APPOINTMENT_STATUS.CANCELLED) {
        return appointment.appointmentDate >= date;
      }

      return false;
    });

    filteredAppointments.sort((a, b) => {
      if (a.status.code === SalesDomain.APPOINTMENT_STATUS.EXPIRED) return -1;
      if (b.status.code === SalesDomain.APPOINTMENT_STATUS.EXPIRED) return 1;
      return a.appointmentDate.getTime() - b.appointmentDate.getTime();
    });

    return filteredAppointments.filter((appointment) => {
      return appointment.budget.workorder === null;
    });
  }

  async changeStatus(appointmentId: string, statusCode: string) {
    const status = await this.appointmentStatusRepository.findByCode(statusCode);

    if (!status) {
      throw new NotFoundException();
    }

    const appointment = await this.repository.findOne({
      where: { id: appointmentId },
      relations: this.RELATIONS,
    });

    if (!appointment) {
      throw new NotFoundException();
    }

    appointment.status = status;
    return this.repository.save(appointment);
  }

  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const budget = await this.budgetRepository.findById(data.budget.id);

    if (!budget) {
      throw new NotFoundException('Budget not found');
    }

    data.budget = budget;

    const createdAppointment = this.repository.create(data);

    return this.repository.save(createdAppointment);
  }

  async updateAppointment(appointmentId: string, data: Partial<Appointment>): Promise<Appointment> {
    const appointment = await this.repository.findOne({
      where: { id: appointmentId },
      relations: this.RELATIONS,
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const updatedAppointment = this.repository.merge(appointment, data);

    return this.repository.save(updatedAppointment);
  }
}
