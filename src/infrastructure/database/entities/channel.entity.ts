import { Column, CreateDateColumn, Entity, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { BudgetGroup } from './budget-group.entity';
import { Workorder } from './workorder.entity';

@Entity('channels')
export class Channel {
  @PrimaryColumn()
  code: string;

  @Column({ type: 'varchar' })
  name: string;

  @OneToMany(() => BudgetGroup, (budgetGroup) => budgetGroup.channel)
  budgetGroups: BudgetGroup[];

  @OneToMany(() => Workorder, (workorder) => workorder.channel)
  workorders: Workorder[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
