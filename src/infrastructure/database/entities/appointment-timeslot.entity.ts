import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BusinessLine } from './business-line.entity';
import { Store } from './store.entity';

export enum AppointmentMode {
  LEAVE = 'LEAVE',
  WAIT = 'WAIT',
  PICKUP = 'PICKUP',
}

@Entity('appointment_timeslots')
export class AppointmentTimeslot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Store)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => BusinessLine)
  @JoinColumn({ name: 'business_line_id' })
  businessLine: BusinessLine;

  @Column({
    type: 'enum',
    enum: AppointmentMode,
  })
  mode: AppointmentMode;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'int' })
  slots: number;

  @Column({ type: 'int' })
  slotsUsed: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
