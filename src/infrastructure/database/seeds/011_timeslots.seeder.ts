import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { Store } from '../entities/store.entity';
import { BusinessLine } from '../entities/business-line.entity';
import { AppointmentTimeslot } from '../entities/appointment-timeslot.entity';
import { AppointmentMode } from '../entities/appointment.entity';

export class TimeSlotSeeder implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const manager = dataSource.createEntityManager();
    const timeSlots = await this.loadTimeslots(manager);

    await manager.save(timeSlots);
  }

  private async loadTimeslots(manager) {
    const timeslots = [];
    const timeslotsBd = await manager.find(AppointmentTimeslot);

    if (timeslotsBd.length > 0) {
      return timeslots;
    }

    const store = await this.getStoreById(manager);
    const businessLine = await this.getBusinessLineById(manager);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1);

    for (let i = 0; i < 100; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      if (currentDate.getDay() >= 1 && currentDate.getDay() <= 5) {
        for (let hour = 9; hour <= 18; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            for (const mode of [AppointmentMode.LEAVE, AppointmentMode.WAIT, AppointmentMode.PICKUP]) {
              const date = new Date(currentDate.setHours(hour, minute, 0, 0));

              const timeslot = new AppointmentTimeslot();
              timeslot.store = store;
              timeslot.businessLine = businessLine;
              timeslot.mode = mode;
              timeslot.date = date;
              timeslot.duration = 30;
              timeslot.slots = 5;
              timeslot.slotsUsed = 0;
              timeslot.createdAt = new Date();
              timeslot.updatedAt = new Date();

              timeslots.push(timeslot);
            }
          }
        }
      }
    }

    return timeslots;
  }

  private async getStoreById(manager) {
    return manager.findOne(Store, { where: { id: '6075fa65-9dd1-464a-8314-26d926a0a964' } });
  }

  private async getBusinessLineById(manager) {
    return manager.findOne(BusinessLine, { where: { id: 1 } });
  }
}
