import { SalesDomain } from 'src/shared/domain/sales.domain';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkorderItemRecord } from './workorder-item-records.entity';
import { WorkorderItemStatus } from './workorder-item-statuses.entity';
import { Workorder } from './workorder.entity';
import { WorkorderServicesItems } from './workorder-services-items';

@Entity('workorder_items')
export class WorkorderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Workorder, { nullable: false })
  @JoinColumn({ name: 'workorder_id' })
  workorder: Workorder;

  @Column({
    type: 'enum',
    enum: SalesDomain.ItemType,
    nullable: false,
    name: 'item_type',
  })
  itemType: SalesDomain.ItemType;

  @Column({ type: 'varchar' })
  itemId: string;

  @Column({ type: 'decimal', nullable: true, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', nullable: true, name: 'unit_discounted_price' })
  unitDiscountedPrice: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'discount_approved_by' })
  discountApprovedBy: User;

  @Column({ type: 'int', nullable: true })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  promotion_id: number;

  @Column({ type: 'decimal', nullable: true })
  total: number;

  @Column({ type: 'varchar', nullable: true })
  itemComboId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_assigned' })
  userAssigned: User;

  @ManyToOne(() => WorkorderItemStatus, { nullable: false })
  @JoinColumn({ name: 'item_status', referencedColumnName: 'code' })
  itemStatus: WorkorderItemStatus;

  @OneToMany(() => WorkorderItemRecord, (workorderItemRecord) => workorderItemRecord.workorderItem)
  workorderItemRecords: WorkorderItemRecord[];

  @Column({ type: 'varchar', nullable: true })
  businessLineId: number;

  @OneToMany(() => WorkorderServicesItems, (workorderServicesItems) => workorderServicesItems.workorderItem)
  workorderServicesItems: WorkorderServicesItems[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
