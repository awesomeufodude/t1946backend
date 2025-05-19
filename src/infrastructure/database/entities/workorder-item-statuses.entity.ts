import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('workorder_item_statuses')
export class WorkorderItemStatus {
  @PrimaryColumn({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  description: string;
}
