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
import { Budget } from './budget.entity';
import { User } from './user.entity';
import { Workorder } from './workorder.entity';
import { WorkorderServicesItems } from './workorder-services-items';
import { BudgetServicesItems } from './budget-services-items ';
import { NoteFile } from './note-file.entity';

@Entity({ name: 'notes' })
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Workorder, (workorder) => workorder.notes)
  @JoinColumn({ name: 'workorder_id' })
  workorder: Workorder;

  @ManyToOne(() => Budget, (budget) => budget.notes)
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @ManyToOne(() => WorkorderServicesItems, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'workorder_service_item_id' })
  workorderServiceItem: WorkorderServicesItems;

  @ManyToOne(() => BudgetServicesItems, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'budget_service_item_id' })
  budgetServiceItem: BudgetServicesItems;

  @Column({ type: 'text', nullable: false })
  text: string;

  @Column({ type: 'varchar', nullable: false })
  step: string;

  @ManyToOne(() => User, (user) => user.notes, { eager: true })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => NoteFile, (noteFile) => noteFile.note, { eager: true, cascade: true })
  files: NoteFile[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
