import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkorderItem } from './workorder-items.entity';
import { Workorder } from './workorder.entity';

@Entity('workorder_item_records')
export class WorkorderItemRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workorder, (workorder) => workorder.workorderItemRecords, { nullable: false })
  @JoinColumn({ name: 'workorder_id' })
  workorder: Workorder;

  @ManyToOne(() => WorkorderItem, (workorderItem) => workorderItem.workorderItemRecords, { nullable: false })
  @JoinColumn({ name: 'workorder_item_id' })
  workorderItem: WorkorderItem;

  @ManyToOne(() => User, (user) => user.workorderItemRecords, { nullable: true })
  @JoinColumn({ name: 'user_assigned' })
  userAssigned: User;

  @Column({ type: 'timestamp', nullable: false })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
