import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Workorder } from './workorder.entity';

@Entity('workorder_statuses')
export class WorkorderStatus {
  @PrimaryColumn({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => Workorder, (workorder) => workorder.status)
  workorders: Workorder[];
}
