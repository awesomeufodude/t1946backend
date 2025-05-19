import { Inject, Injectable, Logger } from '@nestjs/common';
import moment from 'moment-timezone';
import DateUtils from 'src/shared/utils/date.utils';
import { Between, DataSource } from 'typeorm';
import { AppointmentMode, AppointmentTimeslot } from '../entities/appointment-timeslot.entity';
import { AbstractRepository } from './abstract.repository';

@Injectable()
export class AppointmentTimeslotRepository extends AbstractRepository<AppointmentTimeslot> {
  constructor(
    @Inject('DATA_SOURCE') dataSource: DataSource,
    private readonly logger: Logger,
  ) {
    super(dataSource.getRepository(AppointmentTimeslot));
  }

  async updateSlotUsed(date: string, time: string, mode: string) {
    this.logger.log('updateSlotUsed');
    const timeslot = await this.repository
      .createQueryBuilder('appointment-timeslot')
      .where('date = :date', { date: `${date} ${time}` })
      .andWhere('mode = :mode', { mode: AppointmentMode[mode] })
      .getOne();

    if (timeslot) {
      timeslot.slotsUsed += 1;
      await this.repository.save(timeslot);
    }
  }

  async findAvailableSchedulingBlocksByStore(storeId: string, businessLineId: number, date: string, mode: string) {
    const chileTime = DateUtils.getChileanTime();
    const receivedDate = moment.tz(date, 'YYYY-MM-DD', 'America/Santiago');

    const startOfDay = receivedDate.isSame(chileTime, 'day')
      ? receivedDate
          .set('hour', chileTime.get('hour'))
          .set('minute', chileTime.get('minute'))
          .set('second', chileTime.get('second'))
          .toDate()
      : receivedDate.startOf('day').toDate();

    const endOfDay = receivedDate.endOf('day').toDate();

    return await this.repository.find({
      where: {
        businessLine: {
          id: businessLineId,
        },
        store: {
          id: storeId,
        },
        date: Between(startOfDay, endOfDay),
        mode: AppointmentMode[mode],
      },
      order: {
        date: 'ASC',
      },
    });
  }
}
