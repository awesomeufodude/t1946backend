import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { Channel } from './channel.entity';
import { ConsultationChannel } from './consultation-channel.entity';
import { Customer } from './customer.entity';
import { Lead } from './lead.entity';
import { Store } from './store.entity';
import { User } from './user.entity';
import { Vehicle } from './vehicle.entity';

@Index('budget_groups_created_by_store_idx', ['createdBy', 'store'])
@Entity('budget_groups')
export class BudgetGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, (channel) => channel.budgetGroups)
  @JoinColumn({ name: 'channel_code' })
  channel: Channel;

  @Index('budget_groups_created_by_idx')
  @ManyToOne(() => User, (user) => user.budgetGroups, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @ManyToOne(() => Store, (store) => store.budgetGroups, { nullable: true })
  store: Store;

  @ManyToOne(() => Customer, (customer) => customer.budgetGroups, { nullable: true, eager: true })
  customer: Customer;

  @ManyToOne(() => Lead, (lead) => lead.budgetGroups, { nullable: true, eager: true })
  lead: Lead;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.budgetGroups, { nullable: true, eager: true })
  vehicle: Vehicle;

  @ManyToOne(() => ConsultationChannel, (consultationChannel) => consultationChannel.budgetGroups)
  consultationChannel: ConsultationChannel;

  @OneToMany(() => Budget, (budget) => budget.budgetGroup, { eager: true })
  budgets: Budget[];

  @Column({ type: 'boolean' })
  sent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'boolean', nullable: true, default: false })
  extended: boolean;

  @Column({ type: 'boolean', nullable: true, default: false })
  deleted: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
