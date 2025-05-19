import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Budget } from './budget.entity';
import { BudgetServicesItems } from './budget-services-items ';

@Index('budget_items_budget_id_idx', ['budget'])
@Entity('budget_items')
export class BudgetItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Budget, (budget) => budget.budgetItems, { nullable: false })
  @JoinColumn({ name: 'budget_id', foreignKeyConstraintName: 'fk_budget_items_budget' })
  budget: Budget;

  @Column({ type: 'varchar' })
  itemType: string;

  @Column({ type: 'varchar' })
  itemId: string;

  @Column()
  quantity: number;

  @Column()
  unitPrice: number;

  @Column({ type: 'boolean', default: false })
  isChecked: boolean;

  @Column({ type: 'varchar', nullable: true })
  itemComboId: string;

  @Column({ type: 'varchar', nullable: true })
  businessLineId: number;

  @OneToMany(() => BudgetServicesItems, (budgetServicesItems) => budgetServicesItems.budgetItem)
  budgetServicesItems: BudgetServicesItems[];

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
