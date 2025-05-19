import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Appointment } from './appointment.entity';

@Entity({ name: 'appointment_statuses' })
export class AppointmentStatus {
  @PrimaryColumn({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar', nullable: false })
  description: string;

  @OneToMany(() => Appointment, (appointment) => appointment.status)
  appointments: Appointment[];
}
