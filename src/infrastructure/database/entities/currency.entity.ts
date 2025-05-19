import { Column, CreateDateColumn, Entity, OneToMany, UpdateDateColumn } from 'typeorm';
import { Workorder } from './workorder.entity';

@Entity({ name: 'currencies' })
export class Currency {
  @Column({ type: 'int', primary: true, nullable: false })
  id: number;

  @Column({ type: 'varchar', nullable: false })
  code: string;

  @Column({ type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'int', nullable: false })
  decimals: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Workorder, (workorder) => workorder.currency)
  workorders: Workorder[];
}
