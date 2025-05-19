import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppointmentStatus } from './appointment-status.entity';
import { Budget } from './budget.entity';

export enum AppointmentMode {
  LEAVE = 'LEAVE',
  WAIT = 'WAIT',
  PICKUP = 'PICKUP',
}

@Entity({ name: 'appointments' })
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('appointments_budget_id_idx')
  @ManyToOne(() => Budget, (budget) => budget.appointments, { nullable: false, eager: true })
  budget: Budget;

  @Column({ type: 'varchar', enum: AppointmentMode, nullable: true })
  mode: AppointmentMode;

  @Column({ type: 'timestamp', nullable: true })
  appointmentDate: Date;

  @ManyToOne(() => AppointmentStatus, (status) => status.appointments, { nullable: false, eager: true })
  @JoinColumn({ name: 'status' })
  status: AppointmentStatus;

  @Column({ type: 'boolean', default: false, name: 'need_delivery_return' })
  needDeliveryReturn: boolean;

  @Column({ type: 'boolean', default: false, name: 'has_different_location_delivery' })
  hasDifferentLocationDelivery: boolean;

  @Column({ type: 'varchar', nullable: true, name: 'pickup_address' })
  pickupAddress: string;

  @Column({ type: 'varchar', nullable: true, name: 'pickup_address_number' })
  pickupAddressNumber: string;

  @Column({ type: 'varchar', nullable: true, name: 'pickup_address_comment' })
  pickupAddressComment: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'pickup_address_latitude' })
  pickupAddressLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'pickup_address_longitude' })
  pickupAddressLongitude: number;

  @Column({ type: 'varchar', nullable: true, name: 'delivery_address' })
  deliveryAddress: string;

  @Column({ type: 'varchar', nullable: true, name: 'delivery_address_number' })
  deliveryAddressNumber: string;

  @Column({ type: 'varchar', nullable: true, name: 'delivery_address_comment' })
  deliveryAddressComment: string;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'delivery_address_latitude' })
  deliveryAddressLatitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'delivery_address_longitude' })
  deliveryAddressLongitude: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
