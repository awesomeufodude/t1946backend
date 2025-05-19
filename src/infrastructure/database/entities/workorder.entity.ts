import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { Channel } from './channel.entity';
import { ConsultationChannel } from './consultation-channel.entity';
import { Currency } from './currency.entity';
import { Customer } from './customer.entity';
import { Note } from './note.entity';
import { Store } from './store.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';
import { WorkorderItemRecord } from './workorder-item-records.entity';
import { WorkorderItem } from './workorder-items.entity';
import { WorkorderStatus } from './workorder-status.entity';
import { SearchHistory } from './search-history';

export enum DeliveryModeType {
  LEAVE = 'LEAVE',
  WAIT = 'WAIT',
}

@Index('workorders_store_created_by_idx', ['store', 'createdBy'])
@Index('workorders_store_reassigned_to_idx', ['store', 'reassignedTo'])
@Entity('workorders')
export class Workorder {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('workorders_created_by_idx')
  @ManyToOne(() => User, (user) => user.workorders, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => Channel, (channel) => channel.workorders, { nullable: false })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @ManyToOne(() => Store, (store) => store.workorders, { nullable: false })
  store: Store;

  @ManyToOne(() => Customer, (customer) => customer.workorders, { nullable: false, eager: true })
  customer: Customer;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.workorders, { nullable: false, eager: true })
  vehicle: Vehicle;

  @Index('workorders_budget_id_idx')
  @OneToOne(() => Budget, (budget) => budget.workorder, { nullable: true, eager: true })
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @ManyToOne(() => ConsultationChannel, (consultationChannel) => consultationChannel.workorders, { nullable: true })
  consultationChannel: ConsultationChannel;

  @Column({ type: 'numeric', nullable: true })
  odometer: number;

  @Column({ type: 'numeric', nullable: true })
  subTotal: number;

  @Column({ type: 'numeric', nullable: true })
  discount: number;

  @Column({ type: 'numeric', nullable: true })
  iva: number;

  @Column({ type: 'numeric', nullable: true })
  total: number;

  @ManyToOne(() => Currency, (currency) => currency.workorders, { nullable: false })
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;

  @Column({ type: 'timestamp', nullable: true })
  deliveryTime: Date;

  @Column({ type: 'enum', enum: DeliveryModeType, nullable: true })
  deliveryMode: DeliveryModeType;

  @Column({ type: 'boolean', nullable: true })
  reassigned: boolean;

  @ManyToOne(() => User, (user) => user.workorders, { eager: true })
  @JoinColumn({ name: 'reassigned_to' })
  reassignedTo: User;

  @ManyToOne(() => WorkorderStatus, (workorderStatus) => workorderStatus.workorders, { eager: true })
  status: WorkorderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Note, (note) => note.workorder)
  notes: Note[];

  @OneToMany(() => WorkorderItemRecord, (workorderItemRecord) => workorderItemRecord.workorder, { eager: false })
  workorderItemRecords: WorkorderItemRecord[];

  @OneToMany(() => WorkorderItem, (workOrderItem) => workOrderItem.workorder, { eager: false })
  workOrderItems: WorkorderItem[];

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.workOrder)
  searchHistories: SearchHistory[];
}
