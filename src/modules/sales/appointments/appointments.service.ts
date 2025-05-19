import { Injectable, Logger } from '@nestjs/common';
import { AppointmentStatus } from 'src/infrastructure/database/entities/appointment-status.entity';
import { Appointment } from 'src/infrastructure/database/entities/appointment.entity';
import { Budget } from 'src/infrastructure/database/entities/budget.entity';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { AppointmentRepository } from 'src/infrastructure/database/repositories/appointment.repository';
import { BudgetsService } from '../budgets/budgets.service';
import { CreateAppointmentDto, ResponseAppointmentDto } from './appointments.dto';

@Injectable()
export class AppointmentsService {
  private readonly TIME_ZERO = 'T00:00:00';

  constructor(
    private readonly logger: Logger,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly budgetService: BudgetsService,
    private readonly appointmentTimeslotRepository: AppointmentTimeslotRepository,
  ) {}

  async findByUserStoreAndDate(userId: string, storeId: string, date: string) {
    this.logger.log('findByUserStoreAndDate');
    const formattedDate = new Date(date + this.TIME_ZERO);
    const appointments = await this.appointmentRepository.findByUserStoreAndDate(userId, storeId, formattedDate);
    return appointments.map((appointment) => new ResponseAppointmentDto(appointment));
  }

  async changeStatus(appointmentId: string, statusCode: string) {
    this.logger.log('changeStatus');
    const appointment = await this.appointmentRepository.changeStatus(appointmentId, statusCode);
    return new ResponseAppointmentDto(appointment);
  }

  async createAppointment(appointment: CreateAppointmentDto, userId: string) {
    this.logger.log('createAppointment');
    const appointmentData = this.buildAppointmentData(appointment, 'SCHEDULED');
    const createdAppointment = await this.appointmentRepository.createAppointment(appointmentData);
    await this.appointmentTimeslotRepository.updateSlotUsed(appointment.date, appointment.time, appointmentData.mode);
    await this.budgetService.transformAppointementToBudget(userId, appointmentData.budget.id);

    return new ResponseAppointmentDto(createdAppointment);
  }

  async findById(appointmentId: string) {
    this.logger.log('findById');
    const appointment = await this.appointmentRepository.findById(appointmentId);

    const data = new ResponseAppointmentDto(appointment);
    return data;
  }

  async updateAppointment(appointmentId: string, appointment: CreateAppointmentDto) {
    this.logger.log('updateAppointment');
    const appointmentData = this.buildAppointmentData(appointment, 'RESCHEDULED');
    const oldAppointment = await this.appointmentRepository.findById(appointmentData.id);
    const updatedAppointment = await this.appointmentRepository.updateAppointment(appointmentId, appointmentData);

    if (oldAppointment.appointmentDate.getTime() !== appointmentData.appointmentDate.getTime()) {
      await this.appointmentTimeslotRepository.updateSlotUsed(appointment.date, appointment.time, appointmentData.mode);
    }

    return new ResponseAppointmentDto(updatedAppointment);
  }

  private buildAppointmentData(appointment: CreateAppointmentDto, code: string): Partial<Appointment> {
    const {
      budgetId,
      date,
      time,
      mode,
      locationPickup,
      needDeliveryReturn,
      hasDifferentLocationDelivery,
      locationDelivery,
    } = appointment;

    return {
      budget: { id: budgetId } as Budget,
      mode,
      appointmentDate: new Date(`${date}T${time}:00`),
      needDeliveryReturn,
      hasDifferentLocationDelivery,
      pickupAddress: locationPickup?.address || null,
      pickupAddressNumber: locationPickup?.addressNumber || null,
      pickupAddressComment: locationPickup?.addressComment || null,
      pickupAddressLatitude: locationPickup?.addressLatitude || null,
      pickupAddressLongitude: locationPickup?.addressLongitude || null,
      deliveryAddress: locationDelivery?.address || null,
      deliveryAddressNumber: locationDelivery?.addressNumber || null,
      deliveryAddressComment: locationDelivery?.addressComment || null,
      deliveryAddressLatitude: locationDelivery?.addressLatitude || null,
      deliveryAddressLongitude: locationDelivery?.addressLongitude || null,
      status: { code } as AppointmentStatus,
    };
  }
}
