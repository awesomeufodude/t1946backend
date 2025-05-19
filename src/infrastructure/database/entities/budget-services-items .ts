import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BudgetItem } from './budget-item.entity';
import { ServiceItems } from './service-items ';
import { ServiceItemsStatuses } from './service-items-statuses';
import { User } from './user.entity';
import { Note } from './note.entity';

@Entity('budget_services_items')
export class BudgetServicesItems {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => BudgetItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'budget_item_id' })
  budgetItem: BudgetItem;

  @ManyToOne(() => ServiceItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItems;

  @ManyToOne(() => ServiceItemsStatuses, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'status_code', referencedColumnName: 'code' })
  status: ServiceItemsStatuses;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User;

  @OneToMany(() => Note, (note) => note.budgetServiceItem)
  notes: Note[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
