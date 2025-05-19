import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { WorkorderItem } from './workorder-items.entity';
import { ServiceItems } from './service-items ';
import { ServiceItemsStatuses } from './service-items-statuses';
import { Note } from './note.entity';

@Entity('workorder_services_items')
export class WorkorderServicesItems {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => WorkorderItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workorder_item_id' })
  workorderItem: WorkorderItem;

  @ManyToOne(() => ServiceItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_item_id' })
  serviceItem: ServiceItems;

  @ManyToOne(() => ServiceItemsStatuses, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'status_code', referencedColumnName: 'code' })
  status: ServiceItemsStatuses;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'assigned_user_id' })
  assignedUser: User;

  @OneToMany(() => Note, (note) => note.workorderServiceItem)
  notes: Note[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
