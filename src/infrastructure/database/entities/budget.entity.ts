import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { BudgetStatus } from './budget-status.entity';
import { BudgetGroup } from './budget-group.entity';
import { Workorder } from './workorder.entity';
import { BudgetItem } from './budget-item.entity';
import { Note } from './note.entity';
import { SearchHistory } from './search-history';

@Entity('budgets')
export class Budget {
  @PrimaryColumn()
  id: string;

  @Index('budgets_budget_group_idx')
  @ManyToOne(() => BudgetGroup, (budgetGroup) => budgetGroup.budgets)
  budgetGroup: BudgetGroup;

  @OneToMany(() => BudgetItem, (budgetItem) => budgetItem.budget, { eager: false })
  budgetItems: BudgetItem[];

  @Column({ type: 'decimal', nullable: true })
  subTotal: number;

  @Column({ type: 'decimal', nullable: true })
  iva: number;

  @Column({ type: 'decimal', nullable: true })
  total: number;

  @Column({ type: 'int', nullable: false, default: 0 })
  sent: number;

  @ManyToOne(() => BudgetStatus, (budgetStatus) => budgetStatus.budgets)
  status: BudgetStatus;

  @OneToMany(() => Appointment, (appointment) => appointment.budget)
  appointments: Appointment[];

  @OneToOne(() => Workorder, (workorder) => workorder.budget)
  workorder: Workorder;

  @OneToMany(() => SearchHistory, (searchHistory) => searchHistory.budget)
  searchHistories: SearchHistory[];

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @OneToMany(() => Note, (note) => note.budget)
  notes: Note[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
