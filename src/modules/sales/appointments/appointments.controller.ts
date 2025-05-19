import { Body, Controller, Get, Logger, Param, Patch, Post, Query, Request, ValidationPipe } from '@nestjs/common';
import { Private } from 'src/shared/decorators/auth.decorators';
import { AppDomain } from 'src/shared/domain/app.domain';
import { SuccessResponseDto } from 'src/shared/dtos/shared.dto';
import { CreateAppointmentDto, GetAppointmentsDto } from './appointments.dto';
import { AppointmentsService } from './appointments.service';

@Controller('sales/v1/appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    private readonly logger: Logger,
  ) {}

  @Private([AppDomain.Permissions.VIEW_TABLE_APPOINTMENTS])
  @Get()
  async getAllAppoitnmentsByUserStoreAndDate(@Request() req, @Query(new ValidationPipe()) query: GetAppointmentsDto) {
    this.logger.log('getAllConversationsByUserAndDate');
    const selectedDate = query.date || new Date().toISOString().split('T')[0];
    const userId = req.user.sub;
    const storeId = query.storeId;
    const data = await this.appointmentsService.findByUserStoreAndDate(userId, storeId, selectedDate);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.UPDATE_APPOINTMENT_STATUS])
  @Patch(':id/status')
  async changeStatus(@Param('id') id: string, @Body('status') statusCode: string) {
    this.logger.log('changeStatus');
    const data = await this.appointmentsService.changeStatus(id, statusCode);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.CREATE_APPOINTMENT])
  @Post()
  async craeteAppointment(@Request() req, @Body() appointment: CreateAppointmentDto) {
    this.logger.log('createAppointment');
    const userId = req.user.sub;
    const data = await this.appointmentsService.createAppointment(appointment, userId);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.VIEW_TABLE_APPOINTMENTS])
  @Get(':id')
  async getAppointmentById(@Param('id') id: string) {
    this.logger.log('getAppointmentById');
    const data = await this.appointmentsService.findById(id);
    return new SuccessResponseDto(data);
  }

  @Private([AppDomain.Permissions.UPDATE_APPOINTMENT])
  @Patch(':id')
  async updateAppointment(@Param('id') id: string, @Body() appointment: CreateAppointmentDto) {
    this.logger.log('updateAppointment');
    const data = await this.appointmentsService.updateAppointment(id, appointment);
    return new SuccessResponseDto(data);
  }
}
