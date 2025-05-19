import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { SearchCriteria } from './search-criteria';
import { Budget } from './budget.entity';
import { Workorder } from './workorder.entity';

@Entity('search_history')
export class SearchHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Budget, (budget) => budget.searchHistories, { nullable: true, onDelete: 'SET NULL' })
  budget: Budget | null;

  @ManyToOne(() => Workorder, (workOrder) => workOrder.searchHistories, { nullable: true, onDelete: 'SET NULL' })
  workOrder: Workorder | null;

  @Column({ name: 'double_plp', type: 'boolean', default: false })
  doublePlp: boolean;

  @Column({ name: 'front_profile', type: 'int', nullable: true })
  frontProfile: number | null;

  @Column({ name: 'front_width', type: 'int', nullable: true })
  frontWidth: number | null;

  @Column({ name: 'front_rim', type: 'int', nullable: true })
  frontRim: number | null;

  @Column({ name: 'rear_profile', type: 'int', nullable: true })
  rearProfile: number | null;

  @Column({ name: 'rear_width', type: 'int', nullable: true })
  rearWidth: number | null;

  @Column({ name: 'rear_rim', type: 'int', nullable: true })
  rearRim: number | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => SearchCriteria, (searchCriteria) => searchCriteria.searchHistories, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  searchCriteria: SearchCriteria;
}
