import { BadRequestException, Injectable } from '@nestjs/common';
import { AppointmentTimeslot } from 'src/infrastructure/database/entities/appointment-timeslot.entity';
import { AppointmentTimeslotRepository } from 'src/infrastructure/database/repositories/appointment-timeslot.repository';
import { UserRepository } from 'src/infrastructure/database/repositories/user.repository';
import { AppDomain } from 'src/shared/domain/app.domain';
import DateUtils from 'src/shared/utils/date.utils';
import { ResponseUsersDto, SchedulingBlockDto, SchedulingBlocksResponseDto } from './stores.dto';

@Injectable()
export class StoresService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly appointmentTimeslotRepository: AppointmentTimeslotRepository,
  ) {}

  async findUsersByRolesAndStore(storeId: string, roles: string[]) {
    let users;

    if (roles && roles.length > 0) {
      const roleEntities = await this.userRepository.findRolesByNames(roles);

      if (!roleEntities || roleEntities.length === 0) {
        throw new BadRequestException('Roles not found');
      }

      users = await this.userRepository.findUsersByRoleAndStore(
        storeId,
        roleEntities.map((role) => role.id),
      );
    } else {
      throw new BadRequestException('No roles provided');
    }

    if (!users || users.length === 0) {
      throw new BadRequestException('Users not found');
    }

    return users.map((user) => new ResponseUsersDto(user));
  }

  async findSchedulingBlocksByStore(
    storeId: string,
    businessLineId: number,
    date: string,
    mode: string,
  ): Promise<SchedulingBlocksResponseDto> {
    const timeslots = await this.appointmentTimeslotRepository.findAvailableSchedulingBlocksByStore(
      storeId,
      businessLineId,
      date,
      mode,
    );

    const blocks: SchedulingBlockDto[] = timeslots.map((timeslot) => {
      return {
        id: timeslot.id,
        hour: DateUtils.formatHour(timeslot.date.toString()),
        duration: timeslot.duration.toString(),
        status: this.getTimeslotStatus(timeslot),
      };
    });

    return { blocks };
  }

  private getTimeslotStatus(timeslot: AppointmentTimeslot): string {
    return timeslot.slots > timeslot.slotsUsed
      ? AppDomain.SCHEDULING_BLOCK_STATUS.AVAILABLE
      : AppDomain.SCHEDULING_BLOCK_STATUS.SCHEDULED;
  }
}
