import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Budget } from './budget.entity';

@Entity('budgets_statuses')
export class BudgetStatus {
  @PrimaryColumn({ type: 'varchar' })
  code: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => Budget, (budget) => budget.status)
  budgets: Budget[];
}
